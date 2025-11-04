import s from '../index.module.css'
import { SanityHeat } from '../../../lib/sanity'
import PlayerRow from '../PlayerRow'

export default function MatchCard({ heat, refCb, isFinalRound, highlightKind, selectedPlayerId, onClickPlayer }: {
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


