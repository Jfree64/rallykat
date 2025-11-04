'use client'

import { useState, useEffect } from 'react'
import { client, getPlayers } from '../lib/sanity'
import s from './page.module.css'
import { romanize } from '../utils/romanize'
import Link from 'next/link'

interface Player {
  _id: string
  name: string
  emoji: string
  handle: string
  score: number,
  efScore: number
  nickname: string
  slug: string
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const calculateRank = (index: number, players: Player[]): number => {
    if (index === 0) return 1
    const currentScore = players[index].efScore
    const previousScore = players[index - 1].efScore
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
        const query = `*[_type == "player"] | order(efScore desc) {
          _id,
          name,
          nickname,
          emoji,
          handle,
          efScore,
          "slug": slug.current
        }`
        const result = await client.fetch(query)
        const filteredResult = result.filter((player: any) => player.efScore > 0)
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
    <main className={`${s.leaderboard} ${s.efLeaderboard}`}>
      <div className={s.playersList}>
        <div className={s.playerItem} style={{ pointerEvents: 'none' }}>
          <span className={s.label}>Rank</span>
          <span className={s.label}>Player</span>
          <span className={s.label}>Score</span>
        </div>
        {players.map((player, index) => {
          const rank = calculateRank(index, players)
          return (
            <Link href={`/players/${player.slug}`} key={player._id} className={s.playerItem}>
              <span className={`${s.rank} ${rank <= 3 ? s.podium : ''}`}>{rank}{getRankSuffix(rank)}</span>
              <span className={s.player}>{player.nickname}</span>
              <span className={s.score}>{romanize(player.efScore)}</span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}