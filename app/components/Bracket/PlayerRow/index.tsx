import s from '../index.module.css'
import { SanityHeat } from '../../../lib/sanity'

export default function PlayerRow({ player, isWinner, isTbd, isFinalRound, finalRank, linkHighlight, onClickPlayer }: {
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
  ) : (isWinner ? '' : undefined)

  return (
    <div className={`${s.playerRow} ${isWinner ? s.winner : ''} ${rankClass} ${linkHighlight ? s.linkHighlight : ''}`} onClick={(e) => { e.stopPropagation(); onClickPlayer && onClickPlayer(player._id) }}>
      <span className={s.playerEmoji}>{player.emoji}</span>
      <span className={s.playerHandle}>{player.nickname || player.handle}</span>
      {symbol && <span className={isFinalRound ? s.rankMark : s.winMark}>{symbol}</span>}
    </div>
  )
}


