'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import s from './index.module.css'
import { getEventBySlugWithHeats, SanityEventWithHeats, SanityHeat } from '../../lib/sanity'

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

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const getCenterLeft = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect()
      const crect = container.getBoundingClientRect()
      const x = rect.left - crect.left + container.scrollLeft
      const y = rect.top - crect.top + container.scrollTop + rect.height / 2
      return { x, y }
    }

    const getCenterRight = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect()
      const crect = container.getBoundingClientRect()
      const x = rect.right - crect.left + container.scrollLeft
      const y = rect.top - crect.top + container.scrollTop + rect.height / 2
      return { x, y }
    }

    const newConnectors: Array<{ d: string; fromLevel: number; fromIndex: number; toLevel: number; toIndex: number }> = []
    setSvgSize({ width: container.scrollWidth, height: container.scrollHeight })

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
          newConnectors.push({ d, fromLevel: prev.level, fromIndex, toLevel: next.level, toIndex: n })
        }
        if (aEl) addPath(aEl, aIdx)
        if (bEl) addPath(bEl, bIdx)
      }
    }

    setConnectors(newConnectors)

    const onResize = () => {
      setSvgSize({ width: container.scrollWidth, height: container.scrollHeight })
      requestAnimationFrame(() => setConnectors(prev => [...prev]))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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
          {showHeaders && <div className={s.roundHeader}>{finalLevel === level ? 'Final' : `Round ${level}`}</div>}
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

function MatchCard({ heat, refCb, isFinalRound, highlightKind, selectedPlayerId, onClickPlayer }: {
  heat: SanityHeat,
  refCb?: (el: HTMLDivElement | null) => void,
  isFinalRound?: boolean,
  highlightKind?: 'green' | 'red' | 'gold' | 'silver' | 'bronze',
  selectedPlayerId?: string,
  onClickPlayer?: (playerId: string) => void,
}) {
  const players = heat.players ?? []
  const winnerId = heat.winner?._id
  const minRows = 2
  const totalRows = Math.max(players.length, minRows)
  const ranksByIndex: Record<number, 1 | 2 | 3> = {}

  if (isFinalRound) {
    // Rank players for final: winner => 1, remaining in order => 2, 3
    const presentIndexes = players
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !!p)
      .map(({ i }) => i)

    const winnerIndex = presentIndexes.find(i => players[i]?._id === winnerId)
    if (winnerIndex !== undefined) {
      ranksByIndex[winnerIndex] = 1
      const others = presentIndexes.filter(i => i !== winnerIndex)
      if (others[0] !== undefined) ranksByIndex[others[0]] = 2
      if (others[1] !== undefined) ranksByIndex[others[1]] = 3
    } else {
      // If no winner yet, assign provisional order 1..3 by appearance
      if (presentIndexes[0] !== undefined) ranksByIndex[presentIndexes[0]] = 1
      if (presentIndexes[1] !== undefined) ranksByIndex[presentIndexes[1]] = 2
      if (presentIndexes[2] !== undefined) ranksByIndex[presentIndexes[2]] = 3
    }
  }

  const isDimmed = !!selectedPlayerId && !highlightKind
  const matchClasses = [
    s.match,
    highlightKind === 'green' ? s.hiGreen : '',
    highlightKind === 'red' ? s.hiRed : '',
    highlightKind === 'gold' ? s.goldCard : '',
    highlightKind === 'silver' ? s.silverCard : '',
    highlightKind === 'bronze' ? s.bronzeCard : '',
    isDimmed ? s.dimmed : '',
  ].join(' ').trim()

  return (
    <div className={matchClasses} ref={refCb} onClick={(e) => e.stopPropagation()}>
      <div className={s.metaRow}>
        {heat.redemption && <span className={s.redemption}>Redemption</span>}
      </div>
      {Array.from({ length: totalRows }).map((_, i) => {
        const player = players[i]
        const isWinner = !!player && winnerId === player._id
        const finalRank = isFinalRound ? ranksByIndex[i] : undefined
        const isSelected = !!player && !!selectedPlayerId && player._id === selectedPlayerId
        return (
          <PlayerRow
            key={i}
            player={player}
            isWinner={isWinner}
            isTbd={!player}
            isFinalRound={!!isFinalRound}
            finalRank={finalRank}
            linkHighlight={isSelected}
            onClickPlayer={onClickPlayer}
          />
        )
      })}
    </div>
  )
}

function PlayerRow({ player, isWinner, isTbd, isFinalRound, finalRank, linkHighlight, onClickPlayer }: {
  player?: SanityHeat['players'][number];
  isWinner: boolean;
  isTbd: boolean;
  isFinalRound?: boolean;
  finalRank?: 1 | 2 | 3;
  linkHighlight?: boolean;
  onClickPlayer?: (playerId: string) => void;
}) {
  if (!player) {
    return (
      <div className={`${s.playerRow} ${s.tbd}`}>TBD</div>
    )
  }

  const rankClass = isFinalRound && finalRank ? (
    finalRank === 1 ? s.gold : finalRank === 2 ? s.silver : s.bronze
  ) : ''

  const symbol = isFinalRound ? (
    finalRank === 1 ? '👑' : finalRank === 2 ? '🥈' : finalRank === 3 ? '🥉' : undefined
  ) : (isWinner ? '✓' : undefined)

  return (
    <div className={`${s.playerRow} ${isWinner ? s.winner : ''} ${rankClass} ${linkHighlight ? s.linkHighlight : ''}`} onClick={(e) => { e.stopPropagation(); onClickPlayer && onClickPlayer(player._id) }}>
      <span className={s.playerEmoji}>{player.emoji}</span>
      <span className={s.playerHandle}>{player.nickname || player.handle}</span>
      {symbol && <span className={isFinalRound ? s.rankMark : s.winMark}>{symbol}</span>}
    </div>
  )
}


