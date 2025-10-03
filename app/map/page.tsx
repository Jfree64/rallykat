'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { parseGPX, TrackPoint } from '../utils/gpxParser'
import styles from './page.module.css'

const MAPBOX_STYLE = 'mapbox://styles/jfree64/cm9j35wvk009401s5a8oqb3dt'

function getBoundingBoxCenter(points: TrackPoint[]): [number, number] {
  let minLat = Infinity
  let maxLat = -Infinity
  let minLon = Infinity
  let maxLon = -Infinity

  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat
    if (p.lat > maxLat) maxLat = p.lat
    if (p.lon < minLon) minLon = p.lon
    if (p.lon > maxLon) maxLon = p.lon
  }

  const centerLon = (minLon + maxLon) / 2
  const centerLat = (minLat + maxLat) / 2
  return [centerLon, centerLat]
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const rotationRef = useRef<number>(0)
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([])
  const [gpxCenter, setGpxCenter] = useState<[number, number] | null>(null)
  const [styleLoaded, setStyleLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  useEffect(() => {
    // Load GPX file
    fetch('/rk11.gpx')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load GPX file: ${response.status}`)
        }
        return response.text()
      })
      .then(gpxContent => {
        const points = parseGPX(gpxContent)
        console.log('Parsed track points:', points.length, points.slice(0, 3))
        setTrackPoints(points)
        if (points.length > 0) {
          setGpxCenter(getBoundingBoxCenter(points))
        }
      })
      .catch(error => {
        console.error('Error loading GPX file:', error)
        setLoadingError(error.message)
      })
  }, [])

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN || !gpxCenter) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: gpxCenter,
      zoom: 18,
      scrollZoom: false,
      pitch: 45,
      antialias: true
    })

    const rotateMap = () => {
      if (!map.current) return
      rotationRef.current += 0.2
      map.current.rotateTo(rotationRef.current, { duration: 0 })
      requestAnimationFrame(rotateMap)
    }

    map.current.on('load', () => {
      setStyleLoaded(true)
      rotateMap()
    })

    // Handle window resize
    const handleResize = () => {
      if (map.current) {
        map.current.resize()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (map.current) {
        if (map.current && !map.current._removed) {
          map.current.remove()
        }
      }
    }
  }, [gpxCenter])

  useEffect(() => {
    if (!map.current || !styleLoaded || trackPoints.length === 0) return

    console.log('Adding track to map with', trackPoints.length, 'points')

    // Remove existing track layer if it exists
    if (map.current.getLayer('track')) {
      map.current.removeLayer('track')
    }
    if (map.current.getSource('track')) {
      map.current.removeSource('track')
    }

    // Create the track data - Mapbox expects [longitude, latitude] order
    const trackData: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: trackPoints.map(point => [point.lon, point.lat])
      }
    }

    console.log('Track data:', trackData)

    // Add the track to the map
    map.current.addSource('track', {
      type: 'geojson',
      data: trackData,
      lineMetrics: true
    })

    map.current.addLayer({
      id: 'track',
      type: 'line',
      source: 'track',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-width': 4,
        'line-opacity': 1,
        'line-blur': 0,
        'line-gap-width': 0,
        'line-emissive-strength': 1,
        'line-gradient': [
          'interpolate',
          ['linear'],
          ['line-progress'],
          0, '#FF5500',
          0.5, '#0055FF',
          1, '#FF5500',
        ]
      }
    })

    // Fit the map to the track bounds
    const bounds = new mapboxgl.LngLatBounds()
    trackPoints.forEach(point => {
      bounds.extend([point.lon, point.lat])
    })

    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      })
    }

  }, [trackPoints, styleLoaded])

  if (loadingError) {
    return (
      <div className={styles['map-container']}>
        <div className={styles.error}>
          Error loading track: {loadingError}
        </div>
      </div>
    )
  }

  return (
    <div className={styles['map-container']}>
      <div ref={mapContainer} className={styles.map} />
    </div>
  )
} 