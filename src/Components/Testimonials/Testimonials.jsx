import React from 'react';
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    name: "Zawadi Imani",
    location: "Kenya, Nairobi",
    stars: "⭐⭐⭐⭐⭐",
    text: "I've used many booking platforms before, but none compare to the personalized experience and attention to detail that VestaStay provides.",
    img: "https://i.pravatar.cc/150?u=emma"
  },
  {
    id: 2,
    name: "David Samson",
    location: "Nigeria, Lagos",
    stars: "⭐⭐⭐⭐⭐",
    text: "VestaStay exceeded my expectations. From the luxurious rooms to the world-class service, it was a truly unforgettable stay.",
    img: "https://i.pravatar.cc/150?u=david"
  },
  {
    id: 3,
    name: "Sophia Johnson",
    location: "Kenya,Kisumu", 
    stars: "⭐⭐⭐⭐⭐",
    text: "The offers made it easy to plan my trip affordably without compromising on luxury. Highly recommended for discerning travelers!",
    img: "https://i.pravatar.cc/150?u=sophia"
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="section-header">
        <h2 className="main-title">What Our Guests Say</h2>
        <p>Discover why travelers choose VestaStay for their luxury accommodations around the world.</p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <div key={t.id} className="testimonial-card">
            <div className="user-profile">
              <img src={t.img} alt={t.name} className="user-img" />
              <div className="user-meta">
                <h3>{t.name}</h3>
                <p className="user-location">{t.location}</p>
              </div>
            </div>
            <div className="stars">{t.stars}</div>
            <p className="testimonial-text">"{t.text}"</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;