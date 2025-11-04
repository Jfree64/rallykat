import { NextResponse } from "next/server"
import { getPlayers } from "../../lib/sanity"

export async function GET() {
  try {
    const players = await getPlayers()
    return NextResponse.json({ players })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}