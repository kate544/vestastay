import React from 'react';
import './Newsletter.css';

const Newsletter = () => {
  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <div className="newsletter-card">
          <div className="newsletter-content">
            <h4 className="sub-gold">Member Benefits</h4>
            <h2>Join the VestaStay Elite</h2>
            <p>
              Subscribe to our newsletter and receive 15% off your first 
              booking plus access to our secret "Gold Member" deals.
            </p>
            
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required 
              />
              <button type="submit" className="subscribe-btn">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;