'use client'

import { useState, useEffect } from 'react'
import { client } from '../lib/sanity'
import s from './page.module.css'
import Link from 'next/link'
import { RaceCar } from './RaceCar'

const MAX_SCORE = 30

function parseColorToRgb(input: string): [number, number, number] | null {
  if (!input) return null
  let h = input.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map((c) => c + c).join('')
  if (/^[0-9a-fA-F]{6}$/.test(h)) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  if (typeof document === 'undefined') return null
  const el = document.createElement('div')
  el.style.color = input
  el.style.display = 'none'
  document.body.appendChild(el)
  const computed = getComputedStyle(el).color
  document.body.removeChild(el)
  const match = computed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [h, s, l]
}

function complementaryColor(input: string): string {
  const rgb = parseColorToRgb(input)
  if (!rgb) return '#22d3ee'
  const [h, s] = rgbToHsl(rgb)
  const newH = ((h + 150) % 360 + 360) % 360
  const boostedS = Math.max(s, 0.85)
  const neonL = 0.6
  return hslToHex(newH, boostedS, neonL)
}

interface Player {
  _id: string
  name: string
  emoji: string
  handle: string
  mwScore: number
  nickname: string
  slug: string
  color?: string
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const calculateRank = (index: number, players: Player[]): number => {
    if (index === 0) return 1
    const currentScore = players[index].mwScore
    const previousScore = players[index - 1].mwScore
    if (currentScore === previousScore) {
      return calculateRank(index - 1, players)
    }
    return calculateRank(index - 1, players) + 1
  }

  const getRankSuffix = (rank: number): string => {
    const lastDigit = rank % 10
    const lastTwoDigits = rank % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return 'th'
    if (lastDigit === 1) return 'st'
    if (lastDigit === 2) return 'nd'
    if (lastDigit === 3) return 'rd'
    return 'th'
  }

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const query = `*[_type == "player"] | order(mwScore desc) {
          _id,
          name,
          nickname,
          emoji,
          handle,
          mwScore,
          color,
          "slug": slug.current
        }`
        const result = await client.fetch(query)
        const filteredResult = result.filter((player: any) => player.mwScore > 0)
        setPlayers(filteredResult)
      } catch (error) {
        console.error('Error fetching players:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <main className={`${s.leaderboard} ${s.mwLeaderboard}`}>
      <h1 className={s.title}>Most Wanted</h1>
      <div className={s.playersList}>
        <div className={s.playerItem} style={{ pointerEvents: 'none' }}>
          <span className={s.label}>Rank</span>
          <span className={s.label}>Player</span>
          <span className={s.label}>Score</span>
          <span className={s.label}>Progress</span>
        </div>
        {players.map((player, index) => {
          const rank = calculateRank(index, players)
          const pct = Math.min(player.mwScore / MAX_SCORE, 1) * 100
          const carColor = player.color || '#F4900C'
          const glow = complementaryColor(carColor)
          const podiumClass = rank === 1 ? s.gold : rank === 3 ? s.bronze : s.metal
          return (
            <Link href={`/players/${player.slug}`} key={player._id} className={s.playerItem}>
              <span className={`${s.rank} ${podiumClass}`}>{rank}{getRankSuffix(rank)}</span>
              <span className={`${s.player} ${podiumClass}`}>{player.nickname}</span>
              <span className={`${s.score} ${podiumClass}`}>{player.mwScore}</span>
              <span className={s.track}>
                <span
                  className={s.car}
                  style={{
                    left: `${pct}%`,
                    transform: `translate(-${pct}%, -50%)`,
                  }}
                >
                  <RaceCar color={carColor} emoji={player.emoji} />
                  <span
                    className={s.underglow}
                    style={{
                      background: `radial-gradient(ellipse at center, ${glow} 0%, ${glow}80 35%, transparent 70%)`,
                    }}
                  />
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
