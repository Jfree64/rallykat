'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import s from './index.module.css'

type TrackPoint = { lat: number, lon: number }

const MAPBOX_STYLE = 'mapbox://styles/jfree64/cm9j35wvk009401s5a8oqb3dt'

export default function MiniMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([])

  useEffect(() => {
    // Load a default GPX from public folder; pick the first available like map page does
    // Fallback to a specific one if index is unknown
    const defaultBase = 'spring-1-test'
    fetch(`/gpx/${defaultBase}.gpx`)
      .then(r => r.ok ? r.text() : Promise.reject(new Error('Failed to load GPX')))
      .then(text => {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(text, 'text/xml')
        const pts: TrackPoint[] = []
        const trkpts = xmlDoc.getElementsByTagName('trkpt')
        for (let i = 0; i < trkpts.length; i++) {
          const t = trkpts[i]
          const lat = parseFloat(t.getAttribute('lat') || '0')
          const lon = parseFloat(t.getAttribute('lon') || '0')
          pts.push({ lat, lon })
        }
        setTrackPoints(pts)
      })
      .catch(() => {
        setTrackPoints([])
      })
  }, [])

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: [0, 0],
      zoom: 12,
      interactive: false,
      attributionControl: false,
      pitch: 0,
      bearing: 0
    })

    map.current.on('load', () => {
      // Remove default UI controls if any
      const canvas = map.current!.getCanvas()
      canvas.style.pointerEvents = 'none'

      if (trackPoints.length > 1) {
        const data: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: trackPoints.map(p => [p.lon, p.lat])
          }
        }
        map.current!.addSource('mini-track', { type: 'geojson', data })
        map.current!.addLayer({
          id: 'mini-track',
          type: 'line',
          source: 'mini-track',
          paint: {
            'line-width': 2,
            'line-color': '#ff7a00'
          }
        })

        const bounds = new mapboxgl.LngLatBounds()
        trackPoints.forEach(pt => bounds.extend([pt.lon, pt.lat]))
        if (!bounds.isEmpty()) {
          const camera = map.current!.cameraForBounds(bounds, { padding: 20, maxZoom: 14 })
          map.current!.jumpTo(camera as any)
        }
      }
    })

    return () => {
      if (map.current) {
        const removed = (map.current as unknown as { _removed?: boolean })._removed
        if (!removed) map.current.remove()
      }
    }
  }, [trackPoints])

  return (
    <div className={s.miniMapWrapper}>
      <div ref={mapContainer} className={s.miniMap} />
    </div>
  )
}


