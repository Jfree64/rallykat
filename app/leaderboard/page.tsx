'use client'

import { useState, useEffect } from 'react'
import { client } from '../lib/sanity'
import s from './page.module.css'

interface Racer {
  _id: string
  name: string
  emoji: string
  handle: string
  score: number
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<Racer[]>([])
  const [loading, setLoading] = useState(true)

  const calculateRank = (index: number, players: Racer[]): number => {
    if (index === 0) return 1
    const currentScore = players[index].score
    const previousScore = players[index - 1].score
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
        const query = `*[_type == "player"] | order(score desc) {
          _id,
          name,
          emoji,
          handle,
          score
        }`
        const result = await client.fetch(query)
        setPlayers(result)
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
    <main className={s.leaderboard}>
      <div className={s.playersList}>
        <div className={s.playerItem} style={{ pointerEvents: 'none' }}>
          <span className={s.rank}>Rank</span>
          <span className={s.player}>Player</span>
          <span className={s.score}>Score</span>
        </div>
        {players.map((player, index) => {
          const rank = calculateRank(index, players)
          return (
            <div key={player._id} className={s.playerItem}>
              <span className={s.rank}>{rank}{getRankSuffix(rank)}</span>
              <span className={s.player}>{player.emoji} {player.handle}</span>
              <span className={s.score}>{player.score}</span>
            </div>
          )
        })}
      </div>
    </main>
  )
}