'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { parseGPX, TrackPoint } from '../utils/gpxParser'
import styles from './page.module.css'
import type { GeoJSONSource } from 'mapbox-gl'

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
  const [files, setFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string>('')

  useEffect(() => {
    // Load list of GPX files
    fetch('/api/gpx-files')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.files)) {
          setFiles(data.files)
          const defaultFile = data.files[0] || ''
          setSelectedFile(defaultFile)
        } else {
          throw new Error('Invalid files response')
        }
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error)
        setLoadingError(message)
      })
  }, [])

  useEffect(() => {
    if (!selectedFile) return
    // Load selected GPX file
    fetch(`/gpx/${selectedFile}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load GPX file: ${response.status}`)
        }
        return response.text()
      })
      .then(gpxContent => {
        const points = parseGPX(gpxContent)
        setTrackPoints(points)
        if (points.length > 0) {
          setGpxCenter(getBoundingBoxCenter(points))
        }
      })
      .catch(error => {
        console.error('Error loading GPX file:', error)
        setLoadingError(error.message)
      })
  }, [selectedFile])

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    setStyleLoaded(false)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: gpxCenter ?? [0, 0],
      zoom: 18,
      scrollZoom: false,
      pitch: 45,
      antialias: true
    })

    const rotateMap = () => {
      // avoid rotating a removed or non-existent map
      const removed = (map.current as unknown as { _removed?: boolean } | null)?._removed
      if (!map.current || removed) return
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
        const removed = (map.current as unknown as { _removed?: boolean })._removed
        if (!removed) {
          map.current.remove()
        }
      }
      setStyleLoaded(false)
    }
  }, [gpxCenter])

  useEffect(() => {
    if (!map.current || trackPoints.length === 0) return

    const applyTrackToMap = () => {
      if (!map.current) return

      console.log('Adding/updating track with', trackPoints.length, 'points')

      const trackData: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: trackPoints.map(point => [point.lon, point.lat])
        }
      }

      const existingSource = map.current.getSource('track') as GeoJSONSource | undefined
      if (existingSource) {
        existingSource.setData(trackData as unknown as GeoJSON.GeoJSON)
      } else {
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
      }

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
    }

    if (map.current.isStyleLoaded()) {
      applyTrackToMap()
    } else {
      map.current.once('load', applyTrackToMap)
    }
  }, [trackPoints])

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
      <div className={styles.dropdown}>
        <select
          className={styles.select}
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
        >
          {files.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <div ref={mapContainer} className={styles.map} />
    </div>
  )
} 