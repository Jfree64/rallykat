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

export interface SanityPlayerRef {
  _id: string
  name: string
  emoji: string
  handle: string,
  nickname: string
  email: string
  instagram: string
  efScore: number
  score: number
  wins: number
  losses: number
  appearances: number
  slug: {
    current: string
  }
}

export interface SanityHeat {
  _key?: string
  level: number
  round: number
  redemption: boolean
  players: SanityPlayerRef[]
  winner?: SanityPlayerRef | null
}

export interface SanityEventWithHeats extends SanityEvent {
  heats: SanityHeat[]
  mapUrl?: string
  mapName?: string
  length?: number
  courseType?: string
  difficulty?: string
  series?: {
    _id: string
    name: string
    startDate: string
  }
}

export interface SanityEventMapItem {
  id: string
  eventName: string
  seriesName: string | null
  date: string
  mapName: string | null
  url: string
  slug?: string | null
}

export async function getEvents(): Promise<SanityEvent[]> {
  const query = `*[_type == "event"] | order(date asc) {
    _id,
    name,
    date,
    emoji,
    slug,
    "mapUrl": map.asset->url,
    "series": *[_type == "series" && references(^._id)][0] {
      _id,
      name,
      startDate
    }
  }`

  return await client.fetch(query)
}

export async function getEventBySlugWithHeats(slug: string): Promise<SanityEventWithHeats | null> {
  const query = `*[_type == "event" && slug.current == $slug][0]{
    _id,
    name,
    date,
    emoji,
    slug,
    "mapUrl": map.asset->url,
    length,
    courseType,
    difficulty,
    "series": *[_type == "series" && references(^._id)][0]{
      _id,
      name,
      startDate
    },
    heats[]{
      level,
      round,
      redemption,
      players[]->{ _id, name, emoji, handle, nickname, score, efScore },
      winner->{ _id, name, emoji, handle, score, efScore }
    }
  }`

  return await client.fetch(query, { slug })
}

export async function getEventMapItems(): Promise<SanityEventMapItem[]> {
  const query = `*[_type == "event" && defined(map) && defined(map.asset)]{
    _id,
    "eventName": name,
    date,
    "seriesName": *[_type == "series" && references(^._id)][0].name,
    "url": map.asset->url,
    "slug": slug.current
  } | order(seriesName asc, date asc)`

  return await client.fetch(query)
}

export async function getPlayerById(_id: string): Promise<SanityPlayerRef | null> {
  const query = `*[_type == "player" && _id == $id][0]{
    _id,
    name,
    emoji,
    handle,
    nickname,
    instagram,
    score,
    efScore,
    "wins": count(*[_type == "heat" && winner._id == ^._id]),
    "losses": count(*[_type == "heat" && players[]._id == ^._id && winner._id != ^._id]),
    "appearances": count(*[_type == "heat" && players[]._id == ^._id])
  }`
  return await client.fetch(query, { id: _id })
}

export async function getPlayerBySlug(slug: string): Promise<SanityPlayerRef | null> {
  const query = `*[_type == "player" && slug.current == $slug][0]{
    _id,
    name,
    nickname,
    emoji,
    handle,
    instagram,
    score,
    efScore,
    "wins": count(*[_type == "heat" && winner._id == ^._id]),
    "losses": count(*[_type == "heat" && players[]._id == ^._id && winner._id != ^._id]),
    "appearances": count(*[_type == "heat" && players[]._id == ^._id])
  }`
  return await client.fetch(query, { slug: slug })
}

export async function getPlayers(): Promise<SanityPlayerRef[]> {
  const query = `*[_type == "player"] | order(name asc) {
    _id,
    name,
    nickname,
    emoji,
    handle,
    instagram,
    efScore,
    "slug": slug.current,
    "wins": count(*[_type == "heat" && winner._id == ^._id]),
    "losses": count(*[_type == "heat" && players[]._id == ^._id && winner._id != ^._id]),
    "appearances": count(*[_type == "heat" && players[]._id == ^._id])
  } | order(efScore desc)`
  return await client.fetch(query)
}