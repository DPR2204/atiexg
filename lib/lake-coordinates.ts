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
 * Water waypoints for boat segments.
 *
 * STRATEGY: Routes between Santiago (south) and the west-shore towns
 * (San Pedro, San Juan, San Marcos) go NORTH through the open center
 * of the lake first, then west to the destination.  This guarantees
 * the polyline stays over water — trying to hug the narrow south coast
 * puts points on the San Pedro volcano peninsula.
 *
 * Key format: "OriginName→DestName"
 */
export const WATER_WAYPOINTS: Record<string, LatLng[]> = {

    // ═══════════════════════════════════════════════════════════════
    // Santiago ↔ West shore  (route via open-lake center)
    // ═══════════════════════════════════════════════════════════════

    // ── Santiago ↔ San Juan ──
    'Santiago Atitlán→San Juan La Laguna': [
        { lat: 14.6600, lng: -91.2150 },   // north from Santiago into open lake
        { lat: 14.6900, lng: -91.2100 },   // center of lake, well clear of volcano
        { lat: 14.7100, lng: -91.2400 },   // heading northwest
        { lat: 14.7100, lng: -91.2700 },   // west, approaching San Juan from north
    ],
    'San Juan La Laguna→Santiago Atitlán': [
        { lat: 14.7100, lng: -91.2700 },
        { lat: 14.7100, lng: -91.2400 },
        { lat: 14.6900, lng: -91.2100 },
        { lat: 14.6600, lng: -91.2150 },
    ],

    // ── Santiago ↔ San Pedro ──
    'Santiago Atitlán→San Pedro La Laguna': [
        { lat: 14.6600, lng: -91.2150 },   // north into open lake
        { lat: 14.6900, lng: -91.2100 },   // center of lake
        { lat: 14.7100, lng: -91.2400 },   // northwest
        { lat: 14.7080, lng: -91.2650 },   // approach San Pedro from north
    ],
    'San Pedro La Laguna→Santiago Atitlán': [
        { lat: 14.7080, lng: -91.2650 },
        { lat: 14.7100, lng: -91.2400 },
        { lat: 14.6900, lng: -91.2100 },
        { lat: 14.6600, lng: -91.2150 },
    ],

    // ── Santiago ↔ San Marcos ──
    'Santiago Atitlán→San Marcos La Laguna': [
        { lat: 14.6600, lng: -91.2150 },
        { lat: 14.6900, lng: -91.2100 },
        { lat: 14.7150, lng: -91.2300 },
    ],
    'San Marcos La Laguna→Santiago Atitlán': [
        { lat: 14.7150, lng: -91.2300 },
        { lat: 14.6900, lng: -91.2100 },
        { lat: 14.6600, lng: -91.2150 },
    ],

    // ═══════════════════════════════════════════════════════════════
    // West shore towns (short hops along the coast)
    // ═══════════════════════════════════════════════════════════════

    // ── San Pedro ↔ San Juan (adjacent, slight curve into lake) ──
    'San Pedro La Laguna→San Juan La Laguna': [
        { lat: 14.6990, lng: -91.2750 },
    ],
    'San Juan La Laguna→San Pedro La Laguna': [
        { lat: 14.6990, lng: -91.2750 },
    ],

    // ── San Juan ↔ San Marcos ──
    'San Juan La Laguna→San Marcos La Laguna': [
        { lat: 14.7100, lng: -91.2750 },
        { lat: 14.7200, lng: -91.2680 },
    ],
    'San Marcos La Laguna→San Juan La Laguna': [
        { lat: 14.7200, lng: -91.2680 },
        { lat: 14.7100, lng: -91.2750 },
    ],

    // ── San Pedro ↔ San Marcos ──
    'San Pedro La Laguna→San Marcos La Laguna': [
        { lat: 14.7000, lng: -91.2760 },
        { lat: 14.7120, lng: -91.2720 },
        { lat: 14.7200, lng: -91.2650 },
    ],
    'San Marcos La Laguna→San Pedro La Laguna': [
        { lat: 14.7200, lng: -91.2650 },
        { lat: 14.7120, lng: -91.2720 },
        { lat: 14.7000, lng: -91.2760 },
    ],

    // ═══════════════════════════════════════════════════════════════
    // Panajachel ↔ various  (north shore, mostly open water)
    // ═══════════════════════════════════════════════════════════════

    // ── Panajachel ↔ San Pedro (across center of lake) ──
    'Panajachel→San Pedro La Laguna': [
        { lat: 14.7350, lng: -91.1800 },
        { lat: 14.7200, lng: -91.2200 },
        { lat: 14.7100, lng: -91.2500 },
    ],
    'San Pedro La Laguna→Panajachel': [
        { lat: 14.7100, lng: -91.2500 },
        { lat: 14.7200, lng: -91.2200 },
        { lat: 14.7350, lng: -91.1800 },
    ],

    // ── Panajachel ↔ San Juan ──
    'Panajachel→San Juan La Laguna': [
        { lat: 14.7350, lng: -91.1800 },
        { lat: 14.7200, lng: -91.2200 },
        { lat: 14.7120, lng: -91.2600 },
    ],
    'San Juan La Laguna→Panajachel': [
        { lat: 14.7120, lng: -91.2600 },
        { lat: 14.7200, lng: -91.2200 },
        { lat: 14.7350, lng: -91.1800 },
    ],

    // ── Panajachel ↔ San Marcos ──
    'Panajachel→San Marcos La Laguna': [
        { lat: 14.7380, lng: -91.1800 },
        { lat: 14.7330, lng: -91.2100 },
        { lat: 14.7300, lng: -91.2350 },
    ],
    'San Marcos La Laguna→Panajachel': [
        { lat: 14.7300, lng: -91.2350 },
        { lat: 14.7330, lng: -91.2100 },
        { lat: 14.7380, lng: -91.1800 },
    ],

    // ── Panajachel ↔ Santa Cruz ──
    'Panajachel→Santa Cruz La Laguna': [
        { lat: 14.7390, lng: -91.1800 },
    ],
    'Santa Cruz La Laguna→Panajachel': [
        { lat: 14.7390, lng: -91.1800 },
    ],

    // ── Panajachel ↔ San Antonio Palopó (east shore) ──
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
