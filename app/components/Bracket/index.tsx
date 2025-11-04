'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import s from './index.module.css'
import { SanityEventWithHeats, SanityHeat, SanityPlayerRef } from '../../lib/sanity'
import MatchCard from './MatchCard'
import PlayerInfo from './PlayerInfo'

type GroupedByLevel = Array<{
  level: number
  heats: SanityHeat[]
}>

export interface BracketProps {
  eventSlug?: string
  heats?: SanityHeat[]
  showHeaders?: boolean
}

export default function Bracket({ eventSlug, heats, showHeaders = true }: BracketProps) {
  const [eventData, setEventData] = useState<SanityEventWithHeats | null>(null)
  const [loading, setLoading] = useState<boolean>(!!eventSlug && !heats)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const nodeMapRef = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const [svgSize, setSvgSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [connectors, setConnectors] = useState<Array<{ d: string; fromLevel: number; fromIndex: number; toLevel: number; toIndex: number }>>([])
  const [selectedPerson, setSelectedPerson] = useState<{ playerId: string; level: number } | null>(null)
  const prevViewportWidthRef = useRef<number>(0)

  const allHeats: SanityHeat[] = useMemo(() => {
    if (heats) return heats
    return eventData?.heats ?? []
  }, [heats, eventData])

  const groupedByLevel: GroupedByLevel = useMemo(() => {
    const byLevel: Record<number, SanityHeat[]> = {}
    allHeats.forEach(h => {
      if (typeof h.level !== 'number') return
      if (!byLevel[h.level]) byLevel[h.level] = []
      byLevel[h.level].push(h)
    })
    return Object.entries(byLevel)
      .map(([levelStr, hs]) => ({ level: Number(levelStr), heats: hs.sort((a, b) => (a.round ?? 0) - (b.round ?? 0)) }))
      .sort((a, b) => a.level - b.level)
  }, [allHeats])

  const finalLevel = useMemo(() => {
    if (!groupedByLevel.length) return null
    return groupedByLevel[groupedByLevel.length - 1].level
  }, [groupedByLevel])

  const selectedFinalRank = useMemo<1 | 2 | 3 | undefined>(() => {
    if (!selectedPerson || finalLevel == null) return undefined
    const finalGroup = groupedByLevel.find(g => g.level === finalLevel)
    if (!finalGroup) return undefined
    const finalHeat = finalGroup.heats.find(h => (h.players || []).some(p => p && p._id === selectedPerson.playerId))
    if (!finalHeat) return undefined
    const players = finalHeat.players || []
    const winnerId = finalHeat.winner?._id
    const presentIndexes = players.map((p, i) => ({ p, i })).filter(({ p }) => !!p).map(({ i }) => i)
    const winnerIndex = presentIndexes.find(i => players[i]?._id === winnerId)
    if (winnerIndex !== undefined && players[winnerIndex]?._id === selectedPerson.playerId) return 1
    const others = presentIndexes.filter(i => i !== winnerIndex)
    if (others[0] !== undefined && players[others[0]]?._id === selectedPerson.playerId) return 2
    if (others[1] !== undefined && players[others[1]]?._id === selectedPerson.playerId) return 3
    return undefined
  }, [selectedPerson, groupedByLevel, finalLevel])

  const selectedPlayer = useMemo(() => {
    if (!selectedPerson) return null
    for (const { heats } of groupedByLevel) {
      for (const heat of heats) {
        const found = (heat.players || []).find(p => p && p._id === selectedPerson.playerId)
        if (found) return found
      }
    }
    return null
  }, [selectedPerson, groupedByLevel])

  const selectedPlayerStats = useMemo(() => {
    if (!selectedPerson) return null
    let appearances = 0
    let wins = 0
    groupedByLevel.forEach(({ heats }) => {
      heats.forEach(heat => {
        const inHeat = (heat.players || []).some(p => p && p._id === selectedPerson.playerId)
        if (inHeat) {
          appearances++
          if (heat.winner && heat.winner._id === selectedPerson.playerId) wins++
        }
      })
    })
    const losses = Math.max(appearances - wins, 0)
    return { appearances, wins, losses }
  }, [selectedPerson, groupedByLevel])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const recalculate = () => {
      const c = containerRef.current
      if (!c) return

      const getCenterLeft = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect()
        const crect = c.getBoundingClientRect()
        const x = rect.left - crect.left + c.scrollLeft
        const y = rect.top - crect.top + c.scrollTop + rect.height / 2
        return { x, y }
      }

      const getCenterRight = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect()
        const crect = c.getBoundingClientRect()
        const x = rect.right - crect.left + c.scrollLeft
        const y = rect.top - crect.top + c.scrollTop + rect.height / 2
        return { x, y }
      }

      const nextConnectors: Array<{ d: string; fromLevel: number; fromIndex: number; toLevel: number; toIndex: number }> = []

      setSvgSize({ width: c.scrollWidth, height: c.scrollHeight })

      for (let col = 0; col < groupedByLevel.length - 1; col++) {
        const prev = groupedByLevel[col]
        const next = groupedByLevel[col + 1]
        const nextCount = next.heats.length
        for (let n = 0; n < nextCount; n++) {
          const nextKey = `${next.level}-${n}`
          const nextEl = nodeMapRef.current.get(nextKey) as HTMLElement | null
          if (!nextEl) continue
          const aIdx = n * 2
          const bIdx = n * 2 + 1
          const aEl = nodeMapRef.current.get(`${prev.level}-${aIdx}`) as HTMLElement | null
          const bEl = nodeMapRef.current.get(`${prev.level}-${bIdx}`) as HTMLElement | null

          const end = getCenterLeft(nextEl)
          const addPath = (startEl: HTMLElement, fromIndex: number) => {
            const start = getCenterRight(startEl)
            const midX = (start.x + end.x) / 2
            const d = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`
            nextConnectors.push({ d, fromLevel: prev.level, fromIndex, toLevel: next.level, toIndex: n })
          }
          if (aEl) addPath(aEl, aIdx)
          if (bEl) addPath(bEl, bIdx)
        }
      }

      setConnectors(nextConnectors)
    }

    // Initial calculation
    prevViewportWidthRef.current = typeof window !== 'undefined' ? window.innerWidth : 0
    recalculate()

    let rAF = 0
    const onResize = () => {
      if (rAF) cancelAnimationFrame(rAF)
      rAF = requestAnimationFrame(() => {
        const c = containerRef.current
        if (!c) return
        const newViewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0
        const newHeight = c.scrollHeight
        setSvgSize({ width: c.scrollWidth, height: newHeight })
        if (newViewportWidth !== prevViewportWidthRef.current) {
          prevViewportWidthRef.current = newViewportWidth
          recalculate()
        }
      })
    }

    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [groupedByLevel])

  if (loading) return <div className={s.loading}>Loading bracket…</div>
  if (error) return <div className={s.error}>{error}</div>
  if (!groupedByLevel.length) return <div className={s.empty}>No bracket data</div>

  const highlightKindByKey = useMemo(() => {
    const map = new Map<string, 'green' | 'red' | 'gold' | 'silver' | 'bronze'>()
    if (!selectedPerson) return map

    groupedByLevel.forEach(({ level, heats }, gi) => {
      heats.forEach((heat, index) => {
        const key = `${level}-${index}`
        const hasPlayer = (heat.players || []).some(p => p && p._id === selectedPerson.playerId)
        if (!hasPlayer) return
        if (finalLevel != null && level === finalLevel) {
          if (selectedFinalRank === 1) map.set(key, 'gold')
          else if (selectedFinalRank === 2) map.set(key, 'silver')
          else if (selectedFinalRank === 3) map.set(key, 'bronze')
          else map.set(key, 'green')
          return
        }
        // Check if player appears in any heat in the next level
        const nextGroup = groupedByLevel[gi + 1]
        const advances = !!nextGroup && nextGroup.heats.some(h => (h.players || []).some(p => p && p._id === selectedPerson.playerId))
        map.set(key, advances ? 'green' : 'red')
      })
    })

    return map
  }, [selectedPerson, groupedByLevel, finalLevel, selectedFinalRank])

  return (
    <div className={s.bracket} ref={containerRef} onClick={() => setSelectedPerson(null)}>
      {groupedByLevel.map(({ level, heats }) => (
        <div key={level} className={s.roundColumn}>
          {showHeaders && <div className={s.roundHeader}>{finalLevel === level ? 'Final (4 laps)' : `Round ${level}  (${level + 1} laps)`}</div>}
          <div className={s.roundMatches}>
            {heats.map((heat, index) => (
              <MatchCard
                key={index}
                heat={heat}
                refCb={(el: HTMLDivElement | null) => nodeMapRef.current.set(`${level}-${index}`, el)}
                isFinalRound={finalLevel === level}
                highlightKind={highlightKindByKey.get(`${level}-${index}`)}
                selectedPlayerId={selectedPerson?.playerId}
                onClickPlayer={(playerId: string) => setSelectedPerson({ playerId, level })}
              />
            ))}
          </div>
        </div>
      ))}
      <PlayerInfo selectedPlayer={selectedPlayer} selectedPlayerStats={selectedPlayerStats} selectedFinalRank={selectedFinalRank} />
      <svg
        className={s.connectorLayer}
        width={svgSize.width}
        height={svgSize.height}
        viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
      >
        {connectors.map((conn, i) => {
          let cls = s.connector
          if (selectedPerson) {
            // determine if the selected person appears in both from and to heats
            const fromHeats = groupedByLevel.find(g => g.level === conn.fromLevel)?.heats || []
            const toHeats = groupedByLevel.find(g => g.level === conn.toLevel)?.heats || []
            const fromHeat = fromHeats[conn.fromIndex]
            const toHeat = toHeats[conn.toIndex]
            const inFrom = (fromHeat?.players || []).some(p => p && p._id === selectedPerson.playerId)
            const inTo = (toHeat?.players || []).some(p => p && p._id === selectedPerson.playerId)
            if (inFrom && inTo) {
              // If connector goes into final, color by final rank; otherwise green
              if (finalLevel != null && conn.toLevel === finalLevel) {
                if (selectedFinalRank === 1) cls = `${s.connector} ${s.connectorGold}`
                else if (selectedFinalRank === 2) cls = `${s.connector} ${s.connectorSilver}`
                else if (selectedFinalRank === 3) cls = `${s.connector} ${s.connectorBronze}`
                else cls = `${s.connector} ${s.connectorGreen}`
              } else {
                cls = `${s.connector} ${s.connectorGreen}`
              }
            }
          }
          return <path key={i} d={conn.d} className={cls} />
        })}
      </svg>
    </div>
  )
}
