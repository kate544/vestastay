import React, { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of VestaStay?")) {
      // Add your logout logic here (e.g., localStorage.clear())
      console.log("Logged out");
      window.location.reload(); 
    }
  };

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
          title="Toggle Theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Logout Button - Desktop */}
        <button className="logout-btn desktop-only" onClick={handleLogout}>
          Logout
        </button>

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
          <hr style={{ border: "0.5px solid #333", width: "100%", margin: "10px 0" }} />
          <li>
            <button className="logout-btn-mobile" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;