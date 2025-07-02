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
    fetch('/rk5.gpx')
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
      center: [-73.9414465, 40.693618],
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
      },
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
        'line-gradient': [
          'interpolate',
          ['linear'],
          ['line-progress'],
          0, '#ff0000',     // Red
          0.0125, '#ffa500', // Orange
          0.025, '#ffff00',  // Yellow
          0.0375, '#00ff00', // Green
          0.05, '#00BFFF',   // Light Blue
          0.0625, '#9370DB', // Medium Purple
          0.075, '#ff0000',  // Red
          0.0875, '#ffa500', // Orange
          0.1, '#ffff00',    // Yellow
          0.1125, '#00ff00', // Green
          0.125, '#00BFFF',  // Light Blue
          0.1375, '#9370DB', // Medium Purple
          0.15, '#ff0000',   // Red
          0.1625, '#ffa500', // Orange
          0.175, '#ffff00',  // Yellow
          0.1875, '#00ff00', // Green
          0.2, '#00BFFF',    // Light Blue
          0.2125, '#9370DB', // Medium Purple
          0.225, '#ff0000',  // Red
          0.2375, '#ffa500', // Orange
          0.25, '#ffff00',   // Yellow
          0.2625, '#00ff00', // Green
          0.275, '#00BFFF',  // Light Blue
          0.2875, '#9370DB', // Medium Purple
          0.3, '#ff0000',    // Red
          0.3125, '#ffa500', // Orange
          0.325, '#ffff00',  // Yellow
          0.3375, '#00ff00', // Green
          0.35, '#00BFFF',   // Light Blue
          0.3625, '#9370DB', // Medium Purple
          0.375, '#ff0000',  // Red
          0.3875, '#ffa500', // Orange
          0.4, '#ffff00',    // Yellow
          0.4125, '#00ff00', // Green
          0.425, '#00BFFF',  // Light Blue
          0.4375, '#9370DB', // Medium Purple
          0.45, '#ff0000',   // Red
          0.4625, '#ffa500', // Orange
          0.475, '#ffff00',  // Yellow
          0.4875, '#00ff00', // Green
          0.5, '#00BFFF',    // Light Blue
          0.5125, '#9370DB', // Medium Purple
          0.525, '#ff0000',  // Red
          0.5375, '#ffa500', // Orange
          0.55, '#ffff00',   // Yellow
          0.5625, '#00ff00', // Green
          0.575, '#00BFFF',  // Light Blue
          0.5875, '#9370DB', // Medium Purple
          0.6, '#ff0000',    // Red
          0.6125, '#ffa500', // Orange
          0.625, '#ffff00',  // Yellow
          0.6375, '#00ff00', // Green
          0.65, '#00BFFF',   // Light Blue
          0.6625, '#9370DB', // Medium Purple
          0.675, '#ff0000',  // Red
          0.6875, '#ffa500', // Orange
          0.7, '#ffff00',    // Yellow
          0.7125, '#00ff00', // Green
          0.725, '#00BFFF',  // Light Blue
          0.7375, '#9370DB', // Medium Purple
          0.75, '#ff0000',   // Red
          0.7625, '#ffa500', // Orange
          0.775, '#ffff00',  // Yellow
          0.7875, '#00ff00', // Green
          0.8, '#00BFFF',    // Light Blue
          0.8125, '#9370DB', // Medium Purple
          0.825, '#ff0000',  // Red
          0.8375, '#ffa500', // Orange
          0.85, '#ffff00',   // Yellow
          0.8625, '#00ff00', // Green
          0.875, '#00BFFF',  // Light Blue
          0.8875, '#9370DB', // Medium Purple
          0.9, '#ff0000',    // Red
          0.9125, '#ffa500', // Orange
          0.925, '#ffff00',  // Yellow
          0.9375, '#00ff00', // Green
          0.95, '#00BFFF',   // Light Blue
          0.9625, '#9370DB', // Medium Purple
          0.975, '#ff0000',  // Red
          0.9875, '#ffa500', // Orange
          1, '#ffff00'       // Yellow
        ],
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