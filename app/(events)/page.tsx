'use client'

import React, { useState, useEffect } from 'react'
import { getEvents, SanityEvent } from '../lib/sanity'
import s from './page.module.css'

const formatDate = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dayOfWeek = days[date.getDay()]
  const month = months[date.getMonth()]
  const day = date.getDate().toString().padStart(2, '0')

  return `${dayOfWeek} ${month} ${day}`
}

const calculateTimeLeft = (targetDate: Date) => {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()

  if (diff <= 0) {
    return '00:00:00:00'
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return `${days.toString().padStart(2, '0')}:${hours
    .toString()
    .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString().padStart(2, '0')
      .toUpperCase()
    }`
}

// Check if event is more than a week away
const isMoreThanWeekAway = (eventDate: Date) => {
  const now = new Date()
  const diff = eventDate.getTime() - now.getTime()
  const daysDiff = diff / (1000 * 60 * 60 * 24)
  return daysDiff > 7
}

// Mask event name with asterisks if more than a week away
const maskEventName = (name: string, eventDate: Date) => {
  if (isMoreThanWeekAway(eventDate)) {
    return name.replace(/[a-zA-Z0-9]/g, '*')
  }
  return name
}

// Group events by series and order by start date
const groupEventsBySeries = (events: SanityEvent[]) => {
  const grouped: Record<string, { events: SanityEvent[], startDate: string }> = {}

  events.forEach(event => {
    const seriesName = event.series?.name || 'Other Events'
    const startDate = event.series?.startDate || '9999-12-31' // Put "Other Events" at the end

    if (!grouped[seriesName]) {
      grouped[seriesName] = { events: [], startDate }
    }
    grouped[seriesName].events.push(event)
  })

  // Convert to array and sort by start date (most recent first)
  return Object.entries(grouped)
    .sort(([, a], [, b]) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .map(([seriesName, { events }]) => ({ seriesName, events }))
}

// Check if a series is past (all events have ended)
const isSeriesPast = (events: SanityEvent[]) => {
  const now = new Date()
  return events.every(event => {
    const eventDate = new Date(event.date + 'T20:00:00-05:00')
    return eventDate.getTime() < now.getTime()
  })
}

export default function Home() {
  const [events, setEvents] = useState<SanityEvent[]>([])
  const [timeLefts, setTimeLefts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [collapsedSeries, setCollapsedSeries] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getEvents()
        setEvents(fetchedEvents)

        // Initialize past series as collapsed
        const groupedEvents = groupEventsBySeries(fetchedEvents)
        const pastSeries = new Set<string>()

        groupedEvents.forEach(({ seriesName, events }) => {
          if (isSeriesPast(events)) {
            pastSeries.add(seriesName)
          }
        })

        setCollapsedSeries(pastSeries)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLefts: Record<string, string> = {}
      events.forEach(event => {
        // Convert Sanity date string to Date object and adjust for EST timezone
        const eventDate = new Date(event.date + 'T20:00:00-05:00')
        newTimeLefts[event.name] = calculateTimeLeft(eventDate)
      })
      setTimeLefts(newTimeLefts)
    }, 1000)

    return () => clearInterval(timer)
  }, [events])

  const toggleSeries = (seriesName: string) => {
    const newCollapsed = new Set(collapsedSeries)
    if (newCollapsed.has(seriesName)) {
      newCollapsed.delete(seriesName)
    } else {
      newCollapsed.add(seriesName)
    }
    setCollapsedSeries(newCollapsed)
  }

  if (loading) {
    return <div className={s.home}>Loading events...</div>
  }

  const groupedEvents = groupEventsBySeries(events)

  return (
    <div className={s.home}>
      {groupedEvents.map(({ seriesName, events }) => {
        const isCollapsed = collapsedSeries.has(seriesName)

        return (
          <div className={s.series} key={seriesName}>
            <h2
              className={s.seriesHeader}
              onClick={() => toggleSeries(seriesName)}
            >
              <span className={s.arrow}>{isCollapsed ? '▶' : '▼'}</span>
              {seriesName}
            </h2>
            {!isCollapsed && (
              <div className={s.seriesEvents}>
                {events.map((event) => {
                  const eventDate = new Date(event.date + 'T20:00:00-05:00')
                  const maskedName = maskEventName(event.name, eventDate)
                  const displayName = `${event.emoji} ${maskedName}`

                  return (
                    <div key={event._id} className={s.raceItem}>
                      <div>{displayName}</div>
                      <div>{formatDate(eventDate)}</div>
                      <div>{timeLefts[event.name] || '00:00:00:00'}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      <p>
        @ WILLOUGHBY PLAYGROUND. REG BEGINS AT 8 PM. RACING AT 9 PM. 4-16 PLAYERS. AGES 4+.
      </p>
    </div>
  )
} 