
import s from './page.module.css'

export default function About() {
  return (
    <div className={s.about}>
      <div className={s.aboutContent}>
        <h1>About</h1>
        <p>RallyKat is an open source, closed course bike race invented by <a href="https://www.instagram.com/rallykatworldwide/">Colin Valee</a>.</p>
        <p>Racing is head-to-head bracket style.</p>
        <p>Local events are held in:</p>
        <p>NYC - <a href="https://www.instagram.com/rallykatworldwide/">Rallykat.nyc</a> hostedby <a href="https://www.instagram.com/worstknowntime/">Jono Freeman</a></p>
        <p>More info coming soon...</p>
      </div>
    </div>
  )
}