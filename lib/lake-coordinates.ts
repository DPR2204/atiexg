/**
 * Geographic coordinates for Lake Atitlán destinations.
 * Used by TourRouteMap to plot routes on the map.
 */

export interface LatLng {
    lat: number;
    lng: number;
}

export const LAKE_CENTER: LatLng = { lat: 14.6880, lng: -91.1950 };

export const LOCATIONS: Record<string, LatLng> = {
    // ── Main dock / departure point ──
    'Panajachel':           { lat: 14.7420, lng: -91.1595 },
    'Muelle de Panajachel': { lat: 14.7405, lng: -91.1610 },

    // ── West shore towns ──
    'San Pedro La Laguna':  { lat: 14.6940, lng: -91.2720 },
    'San Juan La Laguna':   { lat: 14.6995, lng: -91.2825 },
    'San Marcos La Laguna': { lat: 14.7245, lng: -91.2570 },

    // ── South shore ──
    'Santiago Atitlán':     { lat: 14.6365, lng: -91.2295 },
    'San Lucas Tolimán':    { lat: 14.6335, lng: -91.1400 },

    // ── East shore ──
    'San Antonio Palopó':   { lat: 14.7055, lng: -91.1160 },

    // ── Small villages / points of interest ──
    'Santa Cruz La Laguna': { lat: 14.7370, lng: -91.2115 },
    'Jaibalito':            { lat: 14.7340, lng: -91.2335 },
};

/**
 * Water waypoints for boat segments that would otherwise cross land
 * (e.g. around the San Pedro volcano peninsula between Santiago and San Pedro/San Juan).
 * Key format: "OriginName→DestName"
 */
export const WATER_WAYPOINTS: Record<string, LatLng[]> = {
    'Santiago Atitlán→San Juan La Laguna':  [{ lat: 14.660, lng: -91.275 }],
    'San Juan La Laguna→Santiago Atitlán':  [{ lat: 14.660, lng: -91.275 }],
    'Santiago Atitlán→San Pedro La Laguna': [{ lat: 14.658, lng: -91.268 }],
    'San Pedro La Laguna→Santiago Atitlán': [{ lat: 14.658, lng: -91.268 }],
    'Santiago Atitlán→San Marcos La Laguna': [{ lat: 14.660, lng: -91.270 }],
    'San Marcos La Laguna→Santiago Atitlán': [{ lat: 14.660, lng: -91.270 }],
};

/** Location name aliases — maps common text fragments to canonical keys */
const ALIASES: Record<string, string> = {
    'panajachel':       'Panajachel',
    'muelle':           'Muelle de Panajachel',
    'santiago':         'Santiago Atitlán',
    'san pedro':        'San Pedro La Laguna',
    'san juan':         'San Juan La Laguna',
    'san marcos':       'San Marcos La Laguna',
    'san lucas':        'San Lucas Tolimán',
    'san antonio':      'San Antonio Palopó',
    'santa cruz':       'Santa Cruz La Laguna',
    'jaibalito':        'Jaibalito',
    'tostaduría':       'Panajachel',
    'café-bar':         'Panajachel',
    'regreso':          'Panajachel',
    'de vuelta':        'Panajachel',
};

/**
 * Given an itinerary activity text, try to extract the location name
 * and return the matching coordinates.
 */
export function extractLocation(activityText: string): { name: string; coords: LatLng } | null {
    const lower = activityText.toLowerCase();

    // Try aliases first (more specific → less specific)
    const sortedAliases = Object.entries(ALIASES).sort((a, b) => b[0].length - a[0].length);
    for (const [alias, canonical] of sortedAliases) {
        if (lower.includes(alias)) {
            const coords = LOCATIONS[canonical];
            if (coords) return { name: canonical, coords };
        }
    }

    // Fallback: try direct location name match
    for (const [name, coords] of Object.entries(LOCATIONS)) {
        if (lower.includes(name.toLowerCase())) {
            return { name, coords };
        }
    }

    return null;
}

/**
 * Parse a full itinerary and return an ordered array of route points.
 * Allows the final stop to revisit the starting point (closing the loop).
 */
export function buildRouteFromItinerary(
    itinerary: { time: string; activity: string }[]
): { name: string; coords: LatLng; stepIndex: number; isReturn: boolean }[] {
    const seen = new Set<string>();
    const route: { name: string; coords: LatLng; stepIndex: number; isReturn: boolean }[] = [];

    for (let i = 0; i < itinerary.length; i++) {
        const loc = extractLocation(itinerary[i].activity);
        if (!loc) continue;

        if (!seen.has(loc.name)) {
            seen.add(loc.name);
            route.push({ ...loc, stepIndex: i, isReturn: false });
        } else if (
            // Allow re-adding the starting location as the final stop (return leg)
            route.length >= 2 &&
            loc.name === route[0].name &&
            i >= itinerary.length - 2 // must be one of the last 2 steps
        ) {
            route.push({ ...loc, stepIndex: i, isReturn: true });
        }
    }

    return route;
}

/**
 * Build the full polyline path including water waypoints.
 * Returns an array of [lat, lng] tuples for all segments.
 */
export function buildWaterPath(
    route: { name: string; coords: LatLng }[]
): [number, number][] {
    if (route.length < 2) return [];

    const path: [number, number][] = [[route[0].coords.lat, route[0].coords.lng]];

    for (let i = 1; i < route.length; i++) {
        const key = `${route[i - 1].name}→${route[i].name}`;
        const waypoints = WATER_WAYPOINTS[key];
        if (waypoints) {
            for (const wp of waypoints) {
                path.push([wp.lat, wp.lng]);
            }
        }
        path.push([route[i].coords.lat, route[i].coords.lng]);
    }

    return path;
}
