"use client";

import s from './index.module.css'
import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={s.navbar}>
      <div className={s.navLeft}>
        <Link href="/" className={s.navLogo}>RallyKat</Link>
      </div>
      <button
        className={`${s.mobileMenuButton} ${isMenuOpen ? s.active : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`${s.navCenter} ${isMenuOpen ? s.active : ''}`}>
        <Link href="/" className={s.navLink} onClick={() => setIsMenuOpen(false)}>Events</Link>
        <Link href="/leaderboard" className={s.navLink} onClick={() => setIsMenuOpen(false)}>Leaderboard</Link>
        <Link href="/about" className={s.navLink} onClick={() => setIsMenuOpen(false)}>About</Link>
      </div>
    </nav>
  );
}