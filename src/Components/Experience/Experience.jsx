import React from 'react';
import './Experience.css';

const Experience = () => {
  const features = [
    { title: "Luxury Room", desc: "Premium suites with world-class amenities.", icon: "🏨" },
    { title: "Exotic Island", desc: "Access to private and exclusive destinations.", icon: "🏝️" },
    { title: "24/7 Support", desc: "Dedicated concierge for your every need.", icon: "☎️" }
  ];

  return (
    <section className="experience-section" id="experience">
      <div className="experience-container">
        <div className="experience-text">
          <h4 className="sub-gold">Our Excellence</h4>
          <h2>Why Choose VestaStay?</h2>
          <p>We provide more than just a stay; we provide an unforgettable memory tailored to your desires.</p>
        </div>
        <div className="experience-grid">
          {features.map((f, index) => (
            <div key={index} className="exp-card">
              <div className="exp-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;