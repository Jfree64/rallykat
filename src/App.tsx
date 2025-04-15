import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Events from './pages/Events';
import Leaderboard from './pages/Leaderboard';
import Map from './pages/Map';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
