'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { parseGPX, TrackPoint } from '../utils/gpxParser'
import styles from './page.module.css'

const MAPBOX_STYLE = 'mapbox://styles/jfree64/cm9j35wvk009401s5a8oqb3dt'

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const rotationRef = useRef<number>(0)
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([])
  const [styleLoaded, setStyleLoaded] = useState(false)

  useEffect(() => {
    // Load GPX file
    fetch('/rk3.gpx')
      .then(response => response.text())
      .then(gpxContent => {
        const points = parseGPX(gpxContent)
        setTrackPoints(points)
      })
      .catch(error => console.error('Error loading GPX file:', error))
  }, [])

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: [-73.94694266073284, 40.69450824819825],
      zoom: 18,
      scrollZoom: false,
      pitch: 45,
      antialias: true
    })

    const rotateMap = () => {
      if (!map.current) return
      rotationRef.current += 0.1
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
  }, [])

  useEffect(() => {
    if (!map.current || !styleLoaded || trackPoints.length === 0) return

    // Remove existing track layer if it exists
    if (map.current.getLayer('track')) {
      map.current.removeLayer('track')
    }
    if (map.current.getSource('track')) {
      map.current.removeSource('track')
    }

    // Add the track to the map
    map.current.addSource('track', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: trackPoints.map(point => [point.lon, point.lat])
        }
      }
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
        'line-color': '#00ff00',
        'line-width': 8,
        'line-opacity': 1,
        'line-blur': 2,
        'line-emissive-strength': 1,
        'line-gap-width': 0
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [trackPoints, styleLoaded])

  return (
    <div className={styles['map-container']}>
      <div ref={mapContainer} className={styles.map} />
    </div>
  )
} 