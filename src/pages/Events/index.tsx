import { useState, useEffect } from 'react';
import eventsData from '../../data/events.json';

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  description: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setEvents(eventsData.events);
  }, []);

  return (
    <div className="events-list">
      <h1>Upcoming Events</h1>
      {events.map((event) => (
        <div key={event.id} className="event-card">
          <h2>{event.name}</h2>
          <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p>{event.description}</p>
        </div>
      ))}
    </div>
  );
} 