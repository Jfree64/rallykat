import { NextResponse } from 'next/server'
import { getEventMapItems } from '../../lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await getEventMapItems()
    console.log(items)
    return NextResponse.json({ items })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


