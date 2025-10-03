import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'gpx')
    const entries = await fs.readdir(publicDir, { withFileTypes: true })

    const files = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.gpx'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b))

    return NextResponse.json({ files })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


