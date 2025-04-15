export interface TrackPoint {
  lat: number;
  lon: number;
}

export function parseGPX(gpxContent: string): TrackPoint[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, "text/xml");
  const trackPoints: TrackPoint[] = [];

  const trkpts = xmlDoc.getElementsByTagName("trkpt");
  for (let i = 0; i < trkpts.length; i++) {
    const trkpt = trkpts[i];
    const lat = parseFloat(trkpt.getAttribute("lat") || "0");
    const lon = parseFloat(trkpt.getAttribute("lon") || "0");
    trackPoints.push({ lat, lon });
  }

  return trackPoints;
} 