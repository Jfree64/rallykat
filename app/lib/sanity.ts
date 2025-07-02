import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: true,
  perspective: 'published'
})

export interface SanityEvent {
  _id: string
  name: string
  date: string
  emoji: string
  slug: {
    current: string
  }
  series?: {
    _id: string
    name: string
    startDate: string
  }
}

export async function getEvents(): Promise<SanityEvent[]> {
  const query = `*[_type == "event"] | order(date asc) {
    _id,
    name,
    date,
    emoji,
    slug,
    "series": *[_type == "series" && references(^._id)][0] {
      _id,
      name,
      startDate
    }
  }`

  return await client.fetch(query)
} 