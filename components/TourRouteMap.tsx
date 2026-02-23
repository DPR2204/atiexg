import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildRouteFromItinerary, buildWaterPath, LAKE_CENTER } from '../lib/lake-coordinates';

/* ── Inject CSS animation for flowing dashes ── */
const STYLE_ID = 'tour-route-map-styles';
function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        @keyframes flowDash {
            to { stroke-dashoffset: -20; }
        }
        .leaflet-flow-line {
            animation: flowDash 0.8s linear infinite;
        }
    `;
    document.head.appendChild(style);
}

/* ── Numbered circle marker ── */
function createNumberedIcon(index: number, isFirst: boolean, isLast: boolean) {
    const bg = isFirst ? '#dc2626' : isLast ? '#16a34a' : '#1d4ed8';
    return L.divIcon({
        className: '',
        html: `<div style="
            width:28px;height:28px;border-radius:50%;
            background:${bg};color:#fff;
            display:flex;align-items:center;justify-content:center;
            font-size:12px;font-weight:700;font-family:'Poppins',sans-serif;
            border:3px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            position:relative;z-index:10;
        ">${index + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
}

/* ── Combined start/end marker for round-trip routes ── */
function createStartEndIcon() {
    return L.divIcon({
        className: '',
        html: `<div style="
            width:34px;height:34px;border-radius:50%;
            background:conic-gradient(#dc2626 0deg, #dc2626 180deg, #16a34a 180deg, #16a34a 360deg);
            color:#fff;
            display:flex;align-items:center;justify-content:center;
            font-family:'Poppins',sans-serif;
            border:3px solid #fff;
            box-shadow:0 2px 10px rgba(0,0,0,0.35);
            position:relative;z-index:20;
        "><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
        </svg></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
    });
}

/* ── Small directional arrow marker placed at segment midpoint ── */
function createArrowIcon(angleDeg: number) {
    return L.divIcon({
        className: '',
        html: `<div style="
            width:18px;height:18px;
            display:flex;align-items:center;justify-content:center;
            transform:rotate(${angleDeg}deg);
            color:#dc2626;
            font-size:14px;
            filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));
            pointer-events:none;
        ">&#x25B6;</div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}

/** Calculate angle in degrees between two [lat,lng] points */
function bearing(from: [number, number], to: [number, number]): number {
    const dLng = ((to[1] - from[1]) * Math.PI) / 180;
    const lat1 = (from[0] * Math.PI) / 180;
    const lat2 = (to[0] * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
}

/** Midpoint of two [lat,lng] */
function midpoint(a: [number, number], b: [number, number]): [number, number] {
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/* ── Auto-fit bounds ── */
function FitBounds({ positions }: { positions: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length >= 2) {
            const bounds = L.latLngBounds(positions.map(([lat, lng]) => [lat, lng]));
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        } else if (positions.length === 1) {
            map.setView(positions[0], 13);
        }
    }, [positions, map]);
    return null;
}

/* ── Animated polyline: applies CSS class to SVG path for flowing effect ── */
function AnimatedPolyline({ positions }: { positions: [number, number][] }) {
    const polyRef = useRef<L.Polyline | null>(null);

    useEffect(() => {
        if (!polyRef.current) return;
        const el = (polyRef.current as any)._path as SVGPathElement | undefined;
        if (el) {
            el.classList.add('leaflet-flow-line');
        }
    }, [positions]);

    return (
        <Polyline
            ref={polyRef as any}
            positions={positions}
            pathOptions={{
                color: '#ef4444',
                weight: 3,
                opacity: 0.9,
                dashArray: '4, 16',
                lineCap: 'butt',
            }}
        />
    );
}

/* ── Arrow markers along the path ── */
function DirectionArrows({ path }: { path: [number, number][] }) {
    // Place an arrow at the midpoint of each segment
    const arrows = useMemo(() => {
        const result: { pos: [number, number]; angle: number; key: string }[] = [];
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            const mid = midpoint(from, to);
            // Convert geographic bearing to screen rotation
            // bearing: 0=N, 90=E → CSS rotate: 0=right, so subtract 90
            const angle = bearing(from, to) - 90;
            result.push({ pos: mid, angle, key: `arrow-${i}` });
        }
        return result;
    }, [path]);

    return (
        <>
            {arrows.map((a) => (
                <Marker
                    key={a.key}
                    position={a.pos}
                    icon={createArrowIcon(a.angle)}
                    interactive={false}
                />
            ))}
        </>
    );
}

/* ── Main component ── */
interface TourRouteMapProps {
    itinerary: { time: string; activity: string }[];
    className?: string;
}

export default function TourRouteMap({ itinerary, className }: TourRouteMapProps) {
    useEffect(() => { injectStyles(); }, []);

    const route = useMemo(() => buildRouteFromItinerary(itinerary), [itinerary]);
    const waterPath = useMemo(() => buildWaterPath(route), [route]);

    if (route.length < 2) return null;

    const markerPositions: [number, number][] = route.map((r) => [r.coords.lat, r.coords.lng]);

    return (
        <div className={className}>
            <MapContainer
                center={[LAKE_CENTER.lat, LAKE_CENTER.lng]}
                zoom={12}
                scrollWheelZoom={false}
                dragging={true}
                style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                <FitBounds positions={waterPath} />

                {/* Base line (subtle solid) */}
                <Polyline
                    positions={waterPath}
                    pathOptions={{
                        color: '#fca5a5',
                        weight: 4,
                        opacity: 0.5,
                    }}
                />

                {/* Animated flowing dashes */}
                <AnimatedPolyline positions={waterPath} />

                {/* Direction arrows at segment midpoints */}
                <DirectionArrows path={waterPath} />

                {/* Stop markers */}
                {(() => {
                    const isLoop = route.length >= 3 && route[route.length - 1].isReturn;
                    return route.map((stop, idx) => {
                        // Skip the last marker if it's a return to start (we merge it into marker #1)
                        if (isLoop && idx === route.length - 1) return null;

                        const isFirst = idx === 0;
                        const isLast = !isLoop && idx === route.length - 1;
                        const icon = isLoop && isFirst
                            ? createStartEndIcon()
                            : createNumberedIcon(idx, isFirst, isLast);

                        return (
                            <Marker
                                key={`${stop.name}-${idx}`}
                                position={[stop.coords.lat, stop.coords.lng]}
                                icon={icon}
                                zIndexOffset={isLoop && isFirst ? 200 : 100}
                            >
                                <Tooltip direction="top" offset={[0, -18]} opacity={0.95} permanent={false}>
                                    <span style={{ fontWeight: 600, fontSize: 12 }}>
                                        {isLoop && isFirst ? `${stop.name} (inicio / regreso)` : stop.name}
                                    </span>
                                </Tooltip>
                            </Marker>
                        );
                    });
                })()}
            </MapContainer>
        </div>
    );
}
