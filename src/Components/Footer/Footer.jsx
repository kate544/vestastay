import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-column brand-col">
          <h2 className="footer-logo">VestaStay</h2>
          <p>
            Experience the gold standard of travel. We curate iconic stays 
            for the discerning traveler.
          </p>
          <div className="social-links">
            <span>🔵</span> <span>📸</span> <span>🐦</span> <span>💼</span>
          </div>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#hotels">Hotels</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#about">About Us</a></li>
          </ul>
        </div>

        {/* Support - Fixed to remove terminal warnings */}
        <div className="footer-column">
          <h3>Support</h3>
          <ul>
            <li><a href="/">Help Center</a></li>
            <li><a href="/">Privacy Policy</a></li>
            <li><a href="/">Terms of Service</a></li>
            <li><a href="/">Contact Us</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-column">
          <h3>Get in Touch</h3>
          <p>📍 Nairobi, Kenya</p>
          <p>📞 +254 780170460</p>
          <p>✉️ support@vestastay.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} VestaStay. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;