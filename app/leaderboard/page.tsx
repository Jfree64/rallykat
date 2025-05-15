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
        {players.map((player, index) => (
          <div key={player._id} className={s.playerItem}>
            <span className={s.rank}>{index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}</span>
            <span className={s.player}>{player.emoji} {player.handle}</span>
            <span className={s.score}>{player.score}</span>
          </div>
        ))}
      </div>
    </main>
  )
} 