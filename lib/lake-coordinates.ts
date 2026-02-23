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
 * Shore-hugging water waypoints for boat segments.
 * Each entry is a chain of intermediate points that keep the polyline
 * over water — critical around the San Pedro volcano peninsula.
 *
 * Key format: "OriginName→DestName"
 */
export const WATER_WAYPOINTS: Record<string, LatLng[]> = {

    // ── Santiago ↔ San Juan (around San Pedro volcano, western route) ──
    'Santiago Atitlán→San Juan La Laguna': [
        { lat: 14.6380, lng: -91.2420 },   // exit Santiago bay
        { lat: 14.6430, lng: -91.2580 },   // hug south coast
        { lat: 14.6520, lng: -91.2720 },   // round volcano base
        { lat: 14.6650, lng: -91.2830 },   // west side of volcano
        { lat: 14.6830, lng: -91.2870 },   // approach San Juan from south
    ],
    'San Juan La Laguna→Santiago Atitlán': [
        { lat: 14.6830, lng: -91.2870 },
        { lat: 14.6650, lng: -91.2830 },
        { lat: 14.6520, lng: -91.2720 },
        { lat: 14.6430, lng: -91.2580 },
        { lat: 14.6380, lng: -91.2420 },
    ],

    // ── Santiago ↔ San Pedro (same western route, shorter) ──
    'Santiago Atitlán→San Pedro La Laguna': [
        { lat: 14.6380, lng: -91.2420 },
        { lat: 14.6430, lng: -91.2580 },
        { lat: 14.6520, lng: -91.2720 },
        { lat: 14.6650, lng: -91.2810 },
    ],
    'San Pedro La Laguna→Santiago Atitlán': [
        { lat: 14.6650, lng: -91.2810 },
        { lat: 14.6520, lng: -91.2720 },
        { lat: 14.6430, lng: -91.2580 },
        { lat: 14.6380, lng: -91.2420 },
    ],

    // ── San Pedro ↔ San Juan (adjacent along west shore, slight curve out) ──
    'San Pedro La Laguna→San Juan La Laguna': [
        { lat: 14.6960, lng: -91.2800 },
    ],
    'San Juan La Laguna→San Pedro La Laguna': [
        { lat: 14.6960, lng: -91.2800 },
    ],

    // ── Santiago ↔ San Marcos (all the way around west shore) ──
    'Santiago Atitlán→San Marcos La Laguna': [
        { lat: 14.6380, lng: -91.2420 },
        { lat: 14.6430, lng: -91.2580 },
        { lat: 14.6520, lng: -91.2720 },
        { lat: 14.6650, lng: -91.2830 },
        { lat: 14.6900, lng: -91.2870 },
        { lat: 14.7100, lng: -91.2740 },
    ],
    'San Marcos La Laguna→Santiago Atitlán': [
        { lat: 14.7100, lng: -91.2740 },
        { lat: 14.6900, lng: -91.2870 },
        { lat: 14.6650, lng: -91.2830 },
        { lat: 14.6520, lng: -91.2720 },
        { lat: 14.6430, lng: -91.2580 },
        { lat: 14.6380, lng: -91.2420 },
    ],

    // ── Panajachel ↔ San Marcos (north shore, slight curve south to stay in water) ──
    'Panajachel→San Marcos La Laguna': [
        { lat: 14.7380, lng: -91.1800 },
        { lat: 14.7340, lng: -91.2100 },
        { lat: 14.7300, lng: -91.2350 },
    ],
    'San Marcos La Laguna→Panajachel': [
        { lat: 14.7300, lng: -91.2350 },
        { lat: 14.7340, lng: -91.2100 },
        { lat: 14.7380, lng: -91.1800 },
    ],

    // ── Panajachel ↔ Santa Cruz (north shore hop) ──
    'Panajachel→Santa Cruz La Laguna': [
        { lat: 14.7390, lng: -91.1800 },
    ],
    'Santa Cruz La Laguna→Panajachel': [
        { lat: 14.7390, lng: -91.1800 },
    ],

    // ── San Juan ↔ San Marcos (west shore, northward) ──
    'San Juan La Laguna→San Marcos La Laguna': [
        { lat: 14.7100, lng: -91.2770 },
        { lat: 14.7180, lng: -91.2680 },
    ],
    'San Marcos La Laguna→San Juan La Laguna': [
        { lat: 14.7180, lng: -91.2680 },
        { lat: 14.7100, lng: -91.2770 },
    ],

    // ── San Pedro ↔ San Marcos (west shore, northward) ──
    'San Pedro La Laguna→San Marcos La Laguna': [
        { lat: 14.6980, lng: -91.2800 },
        { lat: 14.7100, lng: -91.2770 },
        { lat: 14.7180, lng: -91.2680 },
    ],
    'San Marcos La Laguna→San Pedro La Laguna': [
        { lat: 14.7180, lng: -91.2680 },
        { lat: 14.7100, lng: -91.2770 },
        { lat: 14.6980, lng: -91.2800 },
    ],

    // ── Panajachel ↔ San Antonio Palopó (east shore, hug coast) ──
    'Panajachel→San Antonio Palopó': [
        { lat: 14.7320, lng: -91.1420 },
        { lat: 14.7200, lng: -91.1250 },
    ],
    'San Antonio Palopó→Panajachel': [
        { lat: 14.7200, lng: -91.1250 },
        { lat: 14.7320, lng: -91.1420 },
    ],
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
 * Build the full polyline path including shore-hugging water waypoints.
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
