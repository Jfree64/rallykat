'use client'

import { useEffect, useState } from "react"
import { SanityPlayerRef } from "../lib/sanity"
import s from './page.module.css'
import Link from "next/link"

const PlayersPage = () => {
  const [players, setPlayers] = useState<SanityPlayerRef[]>([])
  const [query, setQuery] = useState('')
  const [filteredPlayers, setFilteredPlayers] = useState<SanityPlayerRef[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

  useEffect(() => {
    fetch('/api/players')
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.players)
      })
  }, [])

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const byQuery = (p: SanityPlayerRef) => {
      if (!normalizedQuery) return true
      const name = p.name?.toLowerCase() || ''
      const nickname = p.nickname?.toLowerCase() || ''
      return name.includes(normalizedQuery) || nickname.includes(normalizedQuery)
    }
    const next = players.filter((p) => byQuery(p))
    setFilteredPlayers(next)
  }, [players, query])

  return (
    <main className={s.playersPage}>
      <h1>Players</h1>
      <div className={s.searchBar}>
        <input
          type="text"
          className={s.searchInput}
          placeholder="Search by name or nickname"
          value={query}
          onChange={(e) => { setQuery(e.target.value) }}
        />
      </div>
      <div className={s.playersHeader}>
        <span className={s.player}>Player</span>
        <span className={s.score}>Handle</span>
      </div>
      <div className={s.playersList}> {filteredPlayers.map((player) => (
        <Link href={`/players/${player.slug}`} key={player._id} className={s.playerItem}>
          <span className={s.player}>{player.emoji} {player.name} {player.nickname ? `(${player.nickname})` : ''}</span>
          <span className={s.score}>@{player.handle}</span>
        </Link>
      ))} </div>
    </main>
  )
}

export default PlayersPage