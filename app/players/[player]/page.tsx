import { useParams } from "next/navigation"
import { getPlayerBySlug } from "../../lib/sanity"

const PlayerPage = async ({ params }: { params: Promise<{ player: string }> }) => {
  const { player: playerSlug } = await params
  const player = await getPlayerBySlug(playerSlug as string)
  if (!player) {
    return <div>Player not found</div>
  }
  return (
    <div>
      <h1>{player.name}</h1>
    </div>
  )
}

export default PlayerPage