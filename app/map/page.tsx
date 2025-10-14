'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { parseGPX, TrackPoint } from '../utils/gpxParser'
import ColorPicker from '../components/ColorPicker'
import s from './page.module.css'
import type { GeoJSONSource } from 'mapbox-gl'
import Loader from '../components/Loader'

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
  type GpxItem = {
    fileName: string // with extension
    baseName: string // without extension
    seriesName: string
    raceNumber: number | null
    courseName: string
    label: string // display label; courseName only
  }

  const [files, setFiles] = useState<GpxItem[]>([])
  const [selectedBaseName, setSelectedBaseName] = useState<string>('')
  const [startColor, setStartColor] = useState<string>('#FF0000')
  const [endColor, setEndColor] = useState<string>('#FF7A00')
  const [isMapReady, setIsMapReady] = useState<boolean>(false)
  const [rotating, setRotating] = useState<boolean>(false)
  const [showControlPanel, setShowControlPanel] = useState<boolean>(true)
  // combobox state moved into ColorCombo component
  const [uploadedTracks, setUploadedTracks] = useState<Record<string, TrackPoint[]>>({})

  const buildGradientExpression = () => ([
    'interpolate',
    ['linear'],
    ['line-progress'],
    0, startColor,
    0.5, endColor,
    1, startColor,
  ])

  // Helpers to parse GPX filenames
  const toBaseName = (name: string) => name.replace(/\.gpx$/i, '')
  const capitalizeWords = (input: string) => input
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const parseItem = (fileName: string): GpxItem => {
    const baseName = toBaseName(fileName)
    // Expected pattern: series-raceNumber-courseName
    const dashed = baseName.match(/^([^-]+)-(\d+)-(.+)$/)
    if (dashed) {
      const seriesName = capitalizeWords(dashed[1])
      const raceNumber = parseInt(dashed[2], 10)
      const courseName = capitalizeWords(dashed[3])
      const label = courseName
      return { fileName, baseName, seriesName, raceNumber, courseName, label }
    }

    // Last resort: unparsed name
    const seriesName = 'Other'
    const raceNumber = null
    const courseName = capitalizeWords(baseName)
    const label = courseName
    return { fileName, baseName, seriesName, raceNumber, courseName, label }
  }

  const handleUploadGpx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsMapReady(false)
      const text = await file.text()
      const points = parseGPX(text)
      if (!points.length) {
        throw new Error('No track points found in GPX')
      }

      // Create a unique base name for the uploaded track
      const originalBase = toBaseName(file.name)
      const safeBase = originalBase.replace(/[^a-z0-9\-]+/gi, '-').replace(/^-+|-+$/g, '') || 'upload'
      let uniqueBase = `upload-${safeBase}`
      const existing = new Set(files.map(f => f.baseName))
      if (existing.has(uniqueBase)) {
        uniqueBase = `upload-${safeBase}-${Date.now()}`
      }

      // Cache points in memory keyed by the unique base name
      setUploadedTracks(prev => ({ ...prev, [uniqueBase]: points }))

      // Inject synthetic item into dropdown under "Uploads"
      const uploadedItem: GpxItem = {
        fileName: file.name,
        baseName: uniqueBase,
        seriesName: 'Uploads',
        raceNumber: null,
        courseName: capitalizeWords(originalBase),
        label: capitalizeWords(originalBase)
      }
      setFiles(prev => [...prev, uploadedItem])

      // Select the uploaded item; selection effect will pick it from cache and fit bounds
      setSelectedBaseName(uniqueBase)
      setLoadingError(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setLoadingError(message)
    } finally {
      // allow re-uploading the same file by clearing the input value
      e.target.value = ''
    }
  }

  useEffect(() => {
    // Load list of GPX files
    fetch('/api/gpx-files')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.files)) {
          const items: GpxItem[] = data.files.map((name: string) => parseItem(name))

          // Determine default selection: first series, lowest race number
          const grouped = items.reduce<Record<string, GpxItem[]>>((acc, it) => {
            acc[it.seriesName] = acc[it.seriesName] || []
            acc[it.seriesName].push(it)
            return acc
          }, {})

          Object.values(grouped).forEach(list => list.sort((a, b) => {
            const aNum = a.raceNumber ?? Number.POSITIVE_INFINITY
            const bNum = b.raceNumber ?? Number.POSITIVE_INFINITY
            if (aNum !== bNum) return aNum - bNum
            return a.label.localeCompare(b.label)
          }))

          const seriesNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b))
          const first = seriesNames.length > 0 && grouped[seriesNames[0]].length > 0
            ? grouped[seriesNames[0]][0]
            : null

          setFiles(items)
          setSelectedBaseName(first?.baseName || items[0]?.baseName || '')
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
    if (!selectedBaseName) return
    setIsMapReady(false)
    // First check in-memory uploads cache
    const cached = uploadedTracks[selectedBaseName]
    if (cached && cached.length) {
      setTrackPoints(cached)
      setGpxCenter(getBoundingBoxCenter(cached))
      setLoadingError(null)
      return
    }

    // Otherwise, load from public folder
    fetch(`/gpx/${selectedBaseName}.gpx`)
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
  }, [selectedBaseName, uploadedTracks])

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    setStyleLoaded(false)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: gpxCenter ?? [0, 0],
      // minZoom: 1,
      // maxZoom: 18,
      scrollZoom: false,
      pitch: 45,
      antialias: true
    })

    const rotateMap = () => {
      // avoid rotating a removed or non-existent map
      const removed = (map.current as unknown as { _removed?: boolean } | null)?._removed
      if (!map.current || removed || rotating) return
      rotationRef.current += 0.1
      map.current.rotateTo(rotationRef.current, { duration: 0 })
      requestAnimationFrame(rotateMap)
    }

    map.current.on('load', () => {
      setStyleLoaded(true)
      rotateMap()
      setRotating(true)
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
            'line-gradient': buildGradientExpression() as unknown as any
          }
        })
      }

      const bounds = new mapboxgl.LngLatBounds()
      trackPoints.forEach(point => {
        bounds.extend([point.lon, point.lat])
      })

      if (!bounds.isEmpty()) {
        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()
        const zeroArea = ne.lng === sw.lng && ne.lat === sw.lat
        if (zeroArea) {
          map.current.setCenter(ne)
          map.current.setZoom(Math.min(map.current.getMaxZoom(), 17))
        } else {
          const camera = map.current.cameraForBounds(bounds, {
            padding: 200,
            maxZoom: 18,
            pitch: 45,
          })
          map.current.easeTo({
            ...camera,
            duration: 0
          })
        }
      }
      setIsMapReady(true)
      console.log('Map is ready')
    }

    if (map.current.isStyleLoaded()) {
      applyTrackToMap()
    } else {
      map.current.once('load', applyTrackToMap)
    }
  }, [trackPoints, styleLoaded])

  // Update gradient live when colors change
  useEffect(() => {
    if (!map.current) return
    const layerExists = !!map.current.getLayer('track')
    if (!layerExists) return
    try {
      map.current.setPaintProperty('track', 'line-gradient', buildGradientExpression() as unknown as any)
    } catch (e) {
      // no-op if layer not yet ready
    }
  }, [startColor, endColor])

  // outside-click handling lives in ColorCombo

  if (loadingError) {
    return (
      <div className={s.mapContainer}>
        <div className={s.error}>
          Error loading track: {loadingError}
        </div>
      </div>
    )
  }

  return (
    <div className={s.mapContainer}>
      <Loader startColor={startColor} endColor={endColor} className={`${isMapReady ? 'hidden' : ''}`} />
      <div className={`${s.controlPanel} ${showControlPanel ? '' : s.collapsed}`}>
        <div className={s.cpHeader}>
          <label>Mapmaker <span className={s.version}>v0.1.0</span></label>
          <div className={s.collapseIconContainer}>
            <button className={s.collapseIcon} style={{ background: `linear-gradient(to right, ${startColor}, ${endColor})` }} onClick={() => setShowControlPanel(!showControlPanel)} />
          </div>
        </div>
        <div className={s.cpContent}>
          <div className={s.cpSection}>
            <label>GPX file</label>
            <select
              className={s.select}
              value={selectedBaseName}
              onChange={(e) => setSelectedBaseName(e.target.value)}
            >
              {/* Dropdown for selecting GPX files */}
              {useMemo(() => {
                const grouped = files.reduce<Record<string, GpxItem[]>>((acc, it) => {
                  acc[it.seriesName] = acc[it.seriesName] || []
                  acc[it.seriesName].push(it)
                  return acc
                }, {})

                const seriesNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

                return seriesNames.map(series => {
                  const list = grouped[series].slice().sort((a, b) => {
                    const aNum = a.raceNumber ?? Number.POSITIVE_INFINITY
                    const bNum = b.raceNumber ?? Number.POSITIVE_INFINITY
                    if (aNum !== bNum) return aNum - bNum
                    return a.label.localeCompare(b.label)
                  })
                  return (
                    <optgroup key={series} label={series}>
                      {list.map(item => (
                        <option key={item.baseName} value={item.baseName}>{item.label}</option>
                      ))}
                    </optgroup>
                  )
                })
              }, [files])}
            </select>
          </div>
          <div className={s.uploadRow}>
            <input
              id="gpxUpload"
              type="file"
              accept=".gpx,application/gpx+xml,text/xml,application/xml"
              className={s.fileInput}
              onChange={handleUploadGpx}
            />
            <label htmlFor="gpxUpload" className={s.button}>Upload GPX</label>
          </div>
          <ColorPicker
            label="Color 1"
            value={startColor}
            onChange={setStartColor}
            inputClassName={s.select}
            placeholder="Start color (#RRGGBB or name)"
          />
          <ColorPicker
            label="Color 2"
            value={endColor}
            onChange={setEndColor}
            inputClassName={s.select}
            placeholder="End color (#RRGGBB or name)"
          />
        </div>
      </div>
      <div ref={mapContainer} className={`${s.map} ${isMapReady ? s.mapReady : ''}`} />
    </div>
  )
} 