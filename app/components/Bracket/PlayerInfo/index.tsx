import s from '../index.module.css'
import { SanityPlayerRef } from '../../../lib/sanity'

export default function PlayerInfo({ selectedPlayer, selectedPlayerStats, selectedFinalRank }: { selectedPlayer: SanityPlayerRef | null; selectedPlayerStats: { appearances: number; wins: number; losses: number } | null; selectedFinalRank?: 1 | 2 | 3 }) {
  if (!selectedPlayer) return null
  return (
    <div className={s.playerInfo}>
      <div className={s.playerInfoHeader}>
        <h2>Player Info</h2>
      </div>
      <label>Name</label>
      <p>{selectedPlayer.name}{selectedPlayer.nickname ? ` (${selectedPlayer.nickname})` : ''}</p>
      <label>Handle</label>
      <p>{selectedPlayer.emoji} {selectedPlayer.handle}</p>
      <label>Event Stats</label>
      {selectedPlayerStats && (
        <>
          <p>Wins: {selectedPlayerStats.wins}</p>
          <p>Losses: {selectedPlayerStats.losses}</p>
          <p>Heats: {selectedPlayerStats.appearances}</p>
        </>
      )}
      {selectedFinalRank && <p>Final Rank: {selectedFinalRank}</p>}
      <label>Series Stats</label>
      {typeof selectedPlayer.score === 'number' && <p>Points: {selectedPlayer.score}</p>}
      {typeof selectedPlayer.efScore === 'number' && <p>EF Score: {selectedPlayer.efScore}</p>}
    </div>
  )
}


