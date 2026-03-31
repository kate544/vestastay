import React, { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <nav className="navbar">
      <div className="logo">VestaStay</div>

      {/* Desktop Links */}
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#hotels">Hotels</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#about">About</a></li>
      </ul>

      <div className="nav-actions">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Search and Login buttons removed */}

        {/* Hamburger (only mobile) */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Drawer Menu (mobile) */}
      <div className={`drawer ${menuOpen ? "open" : ""}`}>
        <button className="close-drawer" onClick={() => setMenuOpen(false)}>✖</button>
        <ul>
          <li><a href="#home" onClick={() => setMenuOpen(false)}>Home</a></li>
          <li><a href="#hotels" onClick={() => setMenuOpen(false)}>Hotels</a></li>
          <li><a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a></li>
          <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;