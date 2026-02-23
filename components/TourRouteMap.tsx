import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildRouteFromItinerary, LAKE_CENTER } from '../lib/lake-coordinates';

/** Numbered circle marker using a divIcon */
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
        ">${index + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
}

/** Auto-fit the map bounds to the route markers */
function FitBounds({ positions }: { positions: [number, number][] }) {
    const map = useMap();
    React.useEffect(() => {
        if (positions.length >= 2) {
            const bounds = L.latLngBounds(positions.map(([lat, lng]) => [lat, lng]));
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        } else if (positions.length === 1) {
            map.setView(positions[0], 13);
        }
    }, [positions, map]);
    return null;
}

interface TourRouteMapProps {
    itinerary: { time: string; activity: string }[];
    className?: string;
}

export default function TourRouteMap({ itinerary, className }: TourRouteMapProps) {
    const route = useMemo(() => buildRouteFromItinerary(itinerary), [itinerary]);

    if (route.length < 2) return null; // Not enough points to draw a route

    const positions: [number, number][] = route.map((r) => [r.coords.lat, r.coords.lng]);

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

                <FitBounds positions={positions} />

                {/* Route line */}
                <Polyline
                    positions={positions}
                    pathOptions={{
                        color: '#ef4444',
                        weight: 3,
                        opacity: 0.7,
                        dashArray: '8, 8',
                    }}
                />

                {/* Stop markers */}
                {route.map((stop, idx) => (
                    <Marker
                        key={stop.name}
                        position={[stop.coords.lat, stop.coords.lng]}
                        icon={createNumberedIcon(idx, idx === 0, idx === route.length - 1)}
                    >
                        <Tooltip direction="top" offset={[0, -16]} opacity={0.95} permanent={false}>
                            <span style={{ fontWeight: 600, fontSize: 12 }}>{stop.name}</span>
                        </Tooltip>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
