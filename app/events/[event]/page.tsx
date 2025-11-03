import Bracket from "../../components/Bracket"
import { getEventBySlugWithHeats } from "../../lib/sanity"
import { SanityEventWithHeats } from "../../lib/sanity"

import s from './page.module.css'
import MiniMap from '../../components/MiniMap'

const EventPage = async ({ params }: { params: Promise<{ event: string }> }) => {
  const { event: eventSlug } = await params
  const eventData = await getEventBySlugWithHeats(eventSlug)
  console.log(eventData)

  if (!eventData) {
    return <div>Event not found</div>
  }
  return (
    <div className={s.eventPage}>
      <h1>{eventData.name}</h1>
      <Bracket heats={eventData.heats} />
      {/* <MiniMap /> */}
    </div>
  );
};

export default EventPage;