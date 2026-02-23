import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildRouteFromItinerary, buildWaterPath, LAKE_CENTER } from '../lib/lake-coordinates';

/* ── Inject CSS for animated flowing line ── */
const STYLE_ID = 'tour-route-map-styles';
function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        @keyframes flowDash {
            to { stroke-dashoffset: -16; }
        }
        .leaflet-flow-line {
            animation: flowDash 0.6s linear infinite;
        }
        .leaflet-tooltip.route-tooltip {
            background: #1f2937;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 600;
            font-family: 'Poppins', sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            white-space: nowrap;
        }
        .leaflet-tooltip.route-tooltip::before {
            border-top-color: #1f2937;
        }
    `;
    document.head.appendChild(style);
}

/* ── Numbered stop marker ── */
function createStopIcon(index: number, color: string) {
    return L.divIcon({
        className: '',
        html: `<div style="
            width:26px;height:26px;border-radius:50%;
            background:${color};color:#fff;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:700;font-family:'Poppins',sans-serif;
            border:2.5px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
        ">${index + 1}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
    });
}

/* ── Combined start/end marker for round-trip routes ── */
function createStartEndIcon() {
    // Gradient ring with a pin icon inside
    return L.divIcon({
        className: '',
        html: `<div style="
            width:32px;height:32px;border-radius:50%;
            background:linear-gradient(135deg, #dc2626, #16a34a);
            color:#fff;
            display:flex;align-items:center;justify-content:center;
            font-family:'Poppins',sans-serif;
            border:2.5px solid #fff;
            box-shadow:0 3px 12px rgba(0,0,0,0.3);
        "><svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
}

/* ── Direction chevron marker at segment midpoint ── */
function createChevronIcon(angleDeg: number) {
    return L.divIcon({
        className: '',
        html: `<div style="
            width:16px;height:16px;
            display:flex;align-items:center;justify-content:center;
            transform:rotate(${angleDeg}deg);
            pointer-events:none;
        "><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
        </svg></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
}

/** Geographic bearing between two [lat,lng] points in degrees */
function bearing(from: [number, number], to: [number, number]): number {
    const dLng = ((to[1] - from[1]) * Math.PI) / 180;
    const lat1 = (from[0] * Math.PI) / 180;
    const lat2 = (to[0] * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Midpoint of two [lat,lng] */
function midpoint(a: [number, number], b: [number, number]): [number, number] {
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/** Distance in degrees between two points (rough, for filtering) */
function dist(a: [number, number], b: [number, number]): number {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

/* ── Auto-fit bounds ── */
function FitBounds({ positions }: { positions: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length >= 2) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [45, 45], maxZoom: 13 });
        } else if (positions.length === 1) {
            map.setView(positions[0], 13);
        }
    }, [positions, map]);
    return null;
}

/* ── Animated polyline overlay ── */
function AnimatedPolyline({ positions }: { positions: [number, number][] }) {
    const polyRef = useRef<L.Polyline | null>(null);

    useEffect(() => {
        if (!polyRef.current) return;
        const el = (polyRef.current as any)._path as SVGPathElement | undefined;
        if (el) el.classList.add('leaflet-flow-line');
    }, [positions]);

    return (
        <Polyline
            ref={polyRef as any}
            positions={positions}
            pathOptions={{
                color: '#ef4444',
                weight: 2.5,
                opacity: 0.85,
                dashArray: '3, 13',
                lineCap: 'round',
            }}
        />
    );
}

/* ── Chevron arrows placed along the path showing direction ── */
function DirectionChevrons({ path }: { path: [number, number][] }) {
    const chevrons = useMemo(() => {
        const result: { pos: [number, number]; angle: number; key: string }[] = [];
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            // Skip very short segments (waypoints close together)
            if (dist(from, to) < 0.008) continue;
            const mid = midpoint(from, to);
            // bearing → CSS rotation: bearing 0=N,90=E → rotate 0=right → subtract 90
            const angle = bearing(from, to) - 90;
            result.push({ pos: mid, angle, key: `chev-${i}` });
        }
        return result;
    }, [path]);

    return (
        <>
            {chevrons.map((c) => (
                <Marker
                    key={c.key}
                    position={c.pos}
                    icon={createChevronIcon(c.angle)}
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

    const isLoop = route.length >= 3 && route[route.length - 1].isReturn;

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
                {/* Voyager tiles — cleaner water/land contrast */}
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                <FitBounds positions={waterPath} />

                {/* Base route line (soft glow) */}
                <Polyline
                    positions={waterPath}
                    pathOptions={{
                        color: '#fca5a5',
                        weight: 5,
                        opacity: 0.4,
                        lineCap: 'round',
                        lineJoin: 'round',
                    }}
                />

                {/* Main route line (solid) */}
                <Polyline
                    positions={waterPath}
                    pathOptions={{
                        color: '#ef4444',
                        weight: 2.5,
                        opacity: 0.6,
                        lineCap: 'round',
                        lineJoin: 'round',
                    }}
                />

                {/* Animated flowing overlay */}
                <AnimatedPolyline positions={waterPath} />

                {/* Direction chevrons */}
                <DirectionChevrons path={waterPath} />

                {/* Stop markers */}
                {route.map((stop, idx) => {
                    // For loops, skip the return marker — merged into start
                    if (isLoop && idx === route.length - 1) return null;

                    const isFirst = idx === 0;
                    const isLast = !isLoop && idx === route.length - 1;

                    let icon: L.DivIcon;
                    let tooltipText: string;

                    if (isLoop && isFirst) {
                        icon = createStartEndIcon();
                        tooltipText = `${stop.name} — Inicio / Regreso`;
                    } else {
                        const color = isFirst ? '#dc2626' : isLast ? '#16a34a' : '#3b82f6';
                        icon = createStopIcon(idx, color);
                        tooltipText = stop.name;
                    }

                    return (
                        <Marker
                            key={`${stop.name}-${idx}`}
                            position={[stop.coords.lat, stop.coords.lng]}
                            icon={icon}
                            zIndexOffset={isFirst ? 200 : 100}
                        >
                            <Tooltip
                                direction="top"
                                offset={[0, -16]}
                                opacity={1}
                                permanent={false}
                                className="route-tooltip"
                            >
                                {tooltipText}
                            </Tooltip>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
