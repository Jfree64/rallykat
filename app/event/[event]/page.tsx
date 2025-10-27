import Bracket from "../../components/Bracket"
import { getEventBySlugWithHeats } from "../../lib/sanity"
import { SanityEventWithHeats } from "../../lib/sanity"

import s from './page.module.css'

const EventPage = async ({ params }: { params: Promise<{ event: string }> }) => {
  const { event: eventSlug } = await params
  const eventData = await getEventBySlugWithHeats(eventSlug)

  if (!eventData) {
    return <div>Event not found</div>
  }
  return (
    <div className={s.eventPage}>
      <h1>{eventData.name}</h1>
      <Bracket heats={eventData.heats} />
    </div>
  );
};

export default EventPage;