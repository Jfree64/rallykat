'use client'

import React, { useState, useEffect } from 'react'
import s from './page.module.css'

// Create target dates in EST
const events = [
  { name: '🧪 //TEST', date: new Date('2025-04-21T20:00:00-05:00') },
  { name: '⭕️ //CIRCLE', date: new Date('2025-05-07T20:00:00-05:00') },
  { name: '🐍 //SNAKE', date: new Date('2025-05-12T20:00:00-05:00') },
  { name: '🛠️ //WRENCH', date: new Date('2025-05-19T20:00:00-05:00') },
  { name: '⭕️ //****', date: new Date('2025-05-21T20:00:00-05:00') },
  { name: '👯 //*****', date: new Date('2025-06-02T20:00:00-05:00') },
  { name: '🌈 //*******', date: new Date('2025-06-09T20:00:00-05:00') },
]

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

export default function Home() {
  const [timeLefts, setTimeLefts] = useState<Record<string, string>>({})

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLefts: Record<string, string> = {}
      events.forEach(event => {
        newTimeLefts[event.name] = calculateTimeLeft(event.date)
      })
      setTimeLefts(newTimeLefts)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className={s.home}>
      {events.map((event, i) => (
        <div key={i} className={s.raceItem}>
          <div>{event.name}</div> <div>{formatDate(event.date)}</div><div>{timeLefts[event.name] || '00:00:00:00'}</div>
        </div>
      ))}
      <p>
        @ WILLOUGHBY PLAYGROUND. REG BEGINS AT 8 PM. RACING AT 9 PM. 4-16 PLAYERS. AGES 4+.
      </p>
    </div>
  )
} 