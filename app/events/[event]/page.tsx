import Bracket from "../../components/Bracket"
import { getEventBySlugWithHeats } from "../../lib/sanity"

import s from './page.module.css'
import Map from '../../map/page'
import { formatDate } from "../../../cms/utils/formatDate"
import { calculateDistanceFeet, parseGPX } from "../../utils/gpxParser"

async function getComputedLengthFeet(mapUrl?: string | null): Promise<number | null> {
  if (!mapUrl) return null
  try {
    const res = await fetch(mapUrl, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const text = await res.text()
    const points = parseGPX(text)
    if (points.length < 2) return null
    return Math.round(calculateDistanceFeet(points))
  } catch {
    return null
  }
}

const EventPage = async ({ params }: { params: Promise<{ event: string }> }) => {
  const { event: eventSlug } = await params
  const eventData = await getEventBySlugWithHeats(eventSlug)

  if (!eventData) {
    return <div>Event not found</div>
  }

  const computedLengthFeet = await getComputedLengthFeet(eventData.mapUrl)
  const displayLength = computedLengthFeet ?? eventData.length

  return (
    <div className={s.eventPage}>
      <div className={s.info}>
        <div className={s.infoHeader}>
          <h2>{eventData.series?.name || ''}</h2>
          <h1>{eventData.name}</h1>
          <p>{formatDate(eventData.date)}</p>
        </div>
        <Map miniMap={true} defaultGpxUrl={eventData.mapUrl || undefined} />
        <div className={s.courseInfo}>
          <h2>Course Info</h2>
          <p>Length: {typeof displayLength === 'number' ? displayLength.toLocaleString() : displayLength} feet</p>
          <p>Type: {eventData.courseType}</p>
          <p>Difficulty: {eventData.difficulty}</p>
        </div>
      </div>
      <Bracket heats={eventData.heats} />
    </div>
  );
};

export default EventPage;