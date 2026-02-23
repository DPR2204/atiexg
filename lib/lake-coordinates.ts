/**
 * Geographic coordinates for Lake Atitlán destinations.
 * Used by TourRouteMap to plot routes on the map.
 *
 * Routes are computed AUTOMATICALLY:
 *   1. If a straight line between two stops stays over water → straight line.
 *   2. If it crosses land → shortest path along the lake shoreline polygon.
 *
 * The lake polygon comes from OpenStreetMap (Nominatim, relation "Lago de Atitlán").
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

// ═══════════════════════════════════════════════════════════════════════════
// Lake Atitlán shoreline polygon — from OpenStreetMap / Nominatim
// (simplified with threshold 0.002 → ~85 vertices)
// ═══════════════════════════════════════════════════════════════════════════

const LAKE_SHORE: LatLng[] = [
    { lat: 14.7030759, lng: -91.2873457 },
    { lat: 14.6950379, lng: -91.2820114 },
    { lat: 14.6963224, lng: -91.2778092 },
    { lat: 14.6934413, lng: -91.2754146 },
    { lat: 14.6978205, lng: -91.2696075 },
    { lat: 14.6862646, lng: -91.2620518 },
    { lat: 14.6762613, lng: -91.2449722 },
    { lat: 14.6628214, lng: -91.2369619 },
    { lat: 14.6572500, lng: -91.2402500 },
    { lat: 14.6511713, lng: -91.2348536 },
    { lat: 14.6480000, lng: -91.2395000 },
    { lat: 14.6411949, lng: -91.2401464 },
    { lat: 14.6402500, lng: -91.2447500 },
    { lat: 14.6367500, lng: -91.2450000 },
    { lat: 14.6277111, lng: -91.2550739 },
    { lat: 14.6122292, lng: -91.2535159 },
    { lat: 14.6332500, lng: -91.2312500 },
    { lat: 14.6358657, lng: -91.2357547 },
    { lat: 14.6410457, lng: -91.2356045 },
    { lat: 14.6433414, lng: -91.2288303 },
    { lat: 14.6467557, lng: -91.2284545 },
    { lat: 14.6484667, lng: -91.2320345 },
    { lat: 14.6516074, lng: -91.2264500 },
    { lat: 14.6532500, lng: -91.2297500 },
    { lat: 14.6617755, lng: -91.2274629 },
    { lat: 14.6571296, lng: -91.2230442 },
    { lat: 14.6620962, lng: -91.2183621 },
    { lat: 14.6643858, lng: -91.2219086 },
    { lat: 14.6628938, lng: -91.2139837 },
    { lat: 14.6648105, lng: -91.2171727 },
    { lat: 14.6675000, lng: -91.2095000 },
    { lat: 14.6642500, lng: -91.2115000 },
    { lat: 14.6630000, lng: -91.2065000 },
    { lat: 14.6667915, lng: -91.2056695 },
    { lat: 14.6656419, lng: -91.1984281 },
    { lat: 14.6720778, lng: -91.1975424 },
    { lat: 14.6742500, lng: -91.1845000 },
    { lat: 14.6719753, lng: -91.1758051 },
    { lat: 14.6762259, lng: -91.1664498 },
    { lat: 14.6682603, lng: -91.1651220 },
    { lat: 14.6653047, lng: -91.1577851 },
    { lat: 14.6610000, lng: -91.1587500 },
    { lat: 14.6675000, lng: -91.1525000 },
    { lat: 14.6645748, lng: -91.1502938 },
    { lat: 14.6619533, lng: -91.1534711 },
    { lat: 14.6580882, lng: -91.1528429 },
    { lat: 14.6589212, lng: -91.1500078 },
    { lat: 14.6562500, lng: -91.1527500 },
    { lat: 14.6513066, lng: -91.1419692 },
    { lat: 14.6458555, lng: -91.1423689 },
    { lat: 14.6432935, lng: -91.1391648 },
    { lat: 14.6386223, lng: -91.1447921 },
    { lat: 14.6384835, lng: -91.1404476 },
    { lat: 14.6339828, lng: -91.1386465 },
    { lat: 14.6457500, lng: -91.1320000 },
    { lat: 14.6511496, lng: -91.1348792 },
    { lat: 14.6541231, lng: -91.1283813 },
    { lat: 14.6617500, lng: -91.1262500 },
    { lat: 14.6597500, lng: -91.1187500 },
    { lat: 14.6631403, lng: -91.1157999 },
    { lat: 14.6745079, lng: -91.1154065 },
    { lat: 14.6866742, lng: -91.1193974 },
    { lat: 14.6956585, lng: -91.1170838 },
    { lat: 14.7029610, lng: -91.1309150 },
    { lat: 14.7193171, lng: -91.1334146 },
    { lat: 14.7212594, lng: -91.1395625 },
    { lat: 14.7302323, lng: -91.1433160 },
    { lat: 14.7347247, lng: -91.1588970 },
    { lat: 14.7461743, lng: -91.1636566 },
    { lat: 14.7480537, lng: -91.1680108 },
    { lat: 14.7397452, lng: -91.1795712 },
    { lat: 14.7430332, lng: -91.1874347 },
    { lat: 14.7390937, lng: -91.1936865 },
    { lat: 14.7406811, lng: -91.2082581 },
    { lat: 14.7278933, lng: -91.2325662 },
    { lat: 14.7312849, lng: -91.2388255 },
    { lat: 14.7286853, lng: -91.2433153 },
    { lat: 14.7239579, lng: -91.2429448 },
    { lat: 14.7218393, lng: -91.2490813 },
    { lat: 14.7237958, lng: -91.2545366 },
    { lat: 14.7200793, lng: -91.2604693 },
    { lat: 14.7242849, lng: -91.2640755 },
    { lat: 14.7137469, lng: -91.2731864 },
    { lat: 14.7115892, lng: -91.2830511 },
    // polygon closes back to first point
];

// ═══════════════════════════════════════════════════════════════════════════
// Geometry helpers
// ═══════════════════════════════════════════════════════════════════════════

/** Squared distance between two points (fast, avoids sqrt) */
function dist2(a: LatLng, b: LatLng): number {
    return (a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2;
}

/** Euclidean distance */
function dist(a: LatLng, b: LatLng): number {
    return Math.sqrt(dist2(a, b));
}

/** Ray-casting point-in-polygon test — returns true if p is inside the lake */
function pointInLake(p: LatLng): boolean {
    let inside = false;
    for (let i = 0, j = LAKE_SHORE.length - 1; i < LAKE_SHORE.length; j = i++) {
        const pi = LAKE_SHORE[i], pj = LAKE_SHORE[j];
        if (
            ((pi.lng > p.lng) !== (pj.lng > p.lng)) &&
            (p.lat < (pj.lat - pi.lat) * (p.lng - pi.lng) / (pj.lng - pi.lng) + pi.lat)
        ) {
            inside = !inside;
        }
    }
    return inside;
}

/**
 * Check if a straight line between two points passes over land.
 * Samples 20 evenly-spaced points along the middle 80% of the segment
 * (skips near endpoints because towns sit on shore = outside polygon).
 */
function segmentCrossesLand(a: LatLng, b: LatLng): boolean {
    const N = 20;
    for (let i = 0; i < N; i++) {
        const t = 0.1 + (i / (N - 1)) * 0.8; // sample from 10% to 90%
        const p: LatLng = {
            lat: a.lat + t * (b.lat - a.lat),
            lng: a.lng + t * (b.lng - a.lng),
        };
        if (!pointInLake(p)) return true;
    }
    return false;
}

/** Index of the nearest LAKE_SHORE vertex to a given point */
function nearestShoreIndex(p: LatLng): number {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < LAKE_SHORE.length; i++) {
        const d = dist2(p, LAKE_SHORE[i]);
        if (d < bestD) { bestD = d; best = i; }
    }
    return best;
}

/** Sum of distances along a chain of points */
function chainLength(pts: LatLng[]): number {
    let d = 0;
    for (let i = 1; i < pts.length; i++) d += dist(pts[i - 1], pts[i]);
    return d;
}

/**
 * Nudge a shore point slightly toward the lake center so the route line
 * appears clearly over water (not exactly on the coastline).
 */
function offsetIntoLake(p: LatLng, amount = 0.0015): LatLng {
    const dx = LAKE_CENTER.lng - p.lng;
    const dy = LAKE_CENTER.lat - p.lat;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return p;
    return {
        lat: p.lat + (dy / len) * amount,
        lng: p.lng + (dx / len) * amount,
    };
}

/**
 * Find the shortest path along the lake shore polygon between two vertex
 * indices. Compares clockwise vs counter-clockwise and returns the shorter.
 * Points are offset slightly into the lake for a cleaner visual.
 */
function shorePath(fromIdx: number, toIdx: number): LatLng[] {
    const n = LAKE_SHORE.length;
    if (fromIdx === toIdx) return [];

    // Clockwise walk
    const cw: LatLng[] = [];
    for (let i = fromIdx; ; i = (i + 1) % n) {
        cw.push(LAKE_SHORE[i]);
        if (i === toIdx) break;
    }

    // Counter-clockwise walk
    const ccw: LatLng[] = [];
    for (let i = fromIdx; ; i = (i - 1 + n) % n) {
        ccw.push(LAKE_SHORE[i]);
        if (i === toIdx) break;
    }

    const chosen = chainLength(cw) <= chainLength(ccw) ? cw : ccw;

    // Offset all intermediate points into the lake (keep first & last as-is
    // because they are the closest vertices to the actual origin/destination)
    return chosen.map((p, i) =>
        i === 0 || i === chosen.length - 1 ? p : offsetIntoLake(p),
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Location name aliases — maps common text fragments to canonical keys
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════

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
            route.length >= 2 &&
            loc.name === route[0].name &&
            i >= itinerary.length - 2
        ) {
            route.push({ ...loc, stepIndex: i, isReturn: true });
        }
    }

    return route;
}

/**
 * Build the full polyline path for the route.
 *
 * For each segment A→B:
 *   • If the straight line stays over water → straight line.
 *   • If it crosses land → walk the shortest direction around the
 *     lake shoreline polygon, offset slightly into the water.
 */
export function buildWaterPath(
    route: { name: string; coords: LatLng }[]
): [number, number][] {
    if (route.length < 2) return [];

    const path: [number, number][] = [[route[0].coords.lat, route[0].coords.lng]];

    for (let i = 1; i < route.length; i++) {
        const from = route[i - 1].coords;
        const to = route[i].coords;

        if (segmentCrossesLand(from, to)) {
            const fromIdx = nearestShoreIndex(from);
            const toIdx = nearestShoreIndex(to);
            const shore = shorePath(fromIdx, toIdx);
            // Skip first shore point (origin is already in path)
            for (let j = 1; j < shore.length; j++) {
                path.push([shore[j].lat, shore[j].lng]);
            }
        }

        path.push([to.lat, to.lng]);
    }

    return path;
}
