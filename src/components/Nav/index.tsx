import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">RallyKat</Link>
      </div>
      <div className="nav-center">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/map">Map</Link>
      </div>
      <div className="nav-right">
        <a href="#" className="cta-button">Join Now</a>
      </div>
    </nav>
  );
}