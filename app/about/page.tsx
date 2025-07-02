import s from './page.module.css'

export default function About() {
  return (
    <div className={s.about}>
      <div className={s.aboutContent}>
        <h1>About</h1>
        <div className={s.videoContainer}>
          <iframe
            src="https://www.youtube.com/embed/oFf_s0E9qGU?si=ThVjatthObGUqQRa"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
        <p>RallyKat is an open source, closed course bike race invented by <a href="https://www.instagram.com/rallykatworldwide/">Colin Valee</a>.</p>
        <p>Racing is head-to-head in a single-elimination bracket and takes place on a short course that is designed to be as fun to watch as it is to race.</p>
        <p>Full documentation coming soon...</p>
        <br />
        <p>Local events:</p>
        <p><a href="https://www.instagram.com/rallykat.nyc/">New York</a> - hosted by <a href="https://www.instagram.com/worstknowntime/">Jono Freeman</a></p>
        <p><a href="https://www.instagram.com/rallykatworldwide/">Los Angeles</a> - hosted by <a href="https://www.instagram.com/nameyourfavoritebread/">Colin Valee</a> (Coming Soon)</p>
        <p><a href="https://www.instagram.com/russell_abernethy_/">Philadelphia</a> - hosted by <a href="https://www.instagram.com/russell_abernethy_/">Russell Abernethy</a> (Coming Soon)</p>
        <br />
      </div>
    </div>
  )
}