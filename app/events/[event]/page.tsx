import Bracket from "../../components/Bracket"
import { getEventBySlugWithHeats } from "../../lib/sanity"
import { SanityEventWithHeats } from "../../lib/sanity"

import s from './page.module.css'
import Map from '../../map/page'
import { formatDate } from "../../../cms/utils/formatDate"

const EventPage = async ({ params }: { params: Promise<{ event: string }> }) => {
  const { event: eventSlug } = await params
  const eventData = await getEventBySlugWithHeats(eventSlug)
  console.log(eventData)

  if (!eventData) {
    return <div>Event not found</div>
  }
  return (
    <div className={s.eventPage}>
      <div className={s.info}>
        <div className={s.infoHeader}>
          <h1>{eventData.name}</h1>
          <p>{formatDate(eventData.date)}</p>
        </div>
        <Map miniMap={true} defaultGpxUrl={eventData.mapUrl || undefined} />
      </div>
      <Bracket heats={eventData.heats} />
    </div>
  );
};

export default EventPage;