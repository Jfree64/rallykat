export interface TrackPoint {
  lat: number;
  lon: number;
}

const TRKPT_REGEX = /<trkpt\b([^>]*)>/gi;
const LAT_ATTR = /\blat\s*=\s*["']([^"']+)["']/i;
const LON_ATTR = /\blon\s*=\s*["']([^"']+)["']/i;

export function parseGPX(gpxContent: string): TrackPoint[] {
  const trackPoints: TrackPoint[] = [];
  let match: RegExpExecArray | null;
  TRKPT_REGEX.lastIndex = 0;
  while ((match = TRKPT_REGEX.exec(gpxContent)) !== null) {
    const attrs = match[1];
    const lat = attrs.match(LAT_ATTR);
    const lon = attrs.match(LON_ATTR);
    if (lat && lon) {
      trackPoints.push({ lat: parseFloat(lat[1]), lon: parseFloat(lon[1]) });
    }
  }
  return trackPoints;
}

const EARTH_RADIUS_METERS = 6371000;
const METERS_PER_FOOT = 0.3048;

function haversineMeters(a: TrackPoint, b: TrackPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function calculateDistanceFeet(points: TrackPoint[]): number {
  if (points.length < 2) return 0;
  let meters = 0;
  for (let i = 1; i < points.length; i++) {
    meters += haversineMeters(points[i - 1], points[i]);
  }
  return meters / METERS_PER_FOOT;
}
