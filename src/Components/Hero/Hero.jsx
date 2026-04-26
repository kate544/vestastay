import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Hero.css";
import bgImage from "../../Assets/VestaStay-img-2.jpeg";

function Hero({ setFilteredRooms, setSelectedRoomId }) {  
  const [allRooms, setAllRooms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    destination: "",
    location: "",
    date: ""
  });

  // Fetch rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:7000/api/rooms");
        const roomsData = response.data;
        setAllRooms(roomsData);

        const uniqueLocations = [
          ...new Set(roomsData.map((room) => room.location).filter(Boolean)),
        ];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error("Error fetching rooms for Hero search:", error);
      }
    };
    fetchRooms();
  }, []);

  // Handle search with glow effect
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!formData.location && !formData.destination) {
      alert("Please select a location or a room type!");
      return;
    }

    let results = allRooms;
    let selectedRoom = null;
    
    if (formData.location) {
      results = results.filter(room => room.location === formData.location);
    }
    if (formData.destination) {
      results = results.filter(room => room.name === formData.destination);
      // Find the specific selected room for highlighting
      selectedRoom = allRooms.find(room => room.name === formData.destination);
    }

    // Pass filtered results to parent component
    if (setFilteredRooms) setFilteredRooms(results);
    
    // Sets the selected room ID for highlighting
    if (selectedRoom && setSelectedRoomId) {
      setSelectedRoomId(selectedRoom._id);
    }

    // Scroll to hotels section
    const roomsSection = document.getElementById("hotels");
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: "smooth" });
    }

    // Additional glow effect for room cards (fallback)
    const searchTerm = formData.destination;
    if (searchTerm) {
      setTimeout(() => {
        // Targets both possible class names for room cards
        const roomCards = document.querySelectorAll('.hotel-card, .room-card, .room-row'); 
        
        roomCards.forEach((card) => {
          const cardText = card.innerText.toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          
          if (cardText.includes(searchLower)) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('highlighted-room');
            
            // Removes highlight after 3 seconds
            setTimeout(() => {
              card.classList.remove('highlighted-room');
            }, 3000);
          }
        });
      }, 800); 
    }
  }, [allRooms, formData, setFilteredRooms, setSelectedRoomId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="overlay">
          <div className="hero-content">
            <h4 className="tagline">The Gold Standard of Travel</h4>
            <h1>Crafting Unforgettable Memories In Iconic Destinations.</h1>
            <p>
              Experience unparalleled service and architectural marvels at our 
              global retreats. Elegance isn't just a choice; it's our promise.
            </p>

            <form className="search-box" onSubmit={handleSearch}>
              <select name="location" value={formData.location} onChange={handleInputChange}>
                <option value="">All Locations</option>
                {locations.map((loc, index) => (
                  <option key={index} value={loc}>{loc}</option>
                ))}
              </select>

              <select name="destination" value={formData.destination} onChange={handleInputChange}>
                <option value="">All Room Types</option>
                {allRooms.map((room) => (
                  <option key={room._id} value={room.name}>
                    {room.name} ({room.type})
                  </option>
                ))}
              </select>

              <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="hero-about" id="about">
        <div className="about-container">
          <div className="about-info">
            <span className="about-label">OUR STORY</span>
            <h2>Luxury Meets Convenience</h2>
            <p>
              VestaStay was born from a desire to simplify high-end travel. We offer a 
              curated selection of the finest rooms across Kenya, ensuring that your 
              stay is defined by comfort, security, and world-class hospitality.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <h3>50+</h3>
                <p>Curated Rooms</p>
              </div>
              <div className="stat-item">
                <h3>4</h3>
                <p>Cities Covered</p>
              </div>
              <div className="stat-item">
                <h3>24/7</h3>
                <p>Concierge</p>
              </div>
            </div>
          </div>
          <div className="about-feature">
            <div className="quote-box">
              <p>"At VestaStay, we don't just provide a room; we provide an experience that stays with you forever."</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;