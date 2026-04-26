import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios';
import './FeaturedHotel.css';
import BookNowModal from '../BookNowModal/BookNowModal';

const FeaturedHotel = ({ filteredRooms, selectedRoomId, setSelectedRoomId, onClearSearch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [viewOnly, setViewOnly] = useState(false); 
  const [hotelsData, setHotelsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const roomRefs = useRef({});

  // Fetch real-time room data from the database
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:7000/api/rooms");
        const formattedRooms = response.data.map(room => ({
          id: room._id,
          name: room.name,
          type: room.type,
          location: room.location,
          price: room.price.toLocaleString(),
          available: room.status === "Available",
          img: room.image || "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg",
          beds: room.type === "Executive Room" 
            ? "Living Area • All meals • Free Wifi • Swimming Pool" 
            : "Free Wifi • Breakfast & Dinner Included"
        }));
        setHotelsData(formattedRooms);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Handle highlighting and scrolling when a room is selected
  useEffect(() => {
    if (selectedRoomId && roomRefs.current[selectedRoomId]) {
      // Scroll to the room
      roomRefs.current[selectedRoomId].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Remove highlight after 3 seconds
      const timer = setTimeout(() => {
        if (setSelectedRoomId) setSelectedRoomId(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedRoomId, setSelectedRoomId]);

  // Determine which rooms to display
  const displayRooms = filteredRooms && filteredRooms.length > 0 
    ? filteredRooms.map(room => ({
        id: room._id,
        name: room.name,
        type: room.type,
        location: room.location,
        price: room.price.toLocaleString(),
        available: room.status === "Available",
        img: room.image || "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg",
        beds: room.type === "Executive Room" 
          ? "Living Area • All meals • Free Wifi • Swimming Pool" 
          : "Free Wifi • Breakfast & Dinner Included"
      }))
    : hotelsData;

  const handleViewDetails = (hotel) => {
    setSelectedHotel(hotel);
    setViewOnly(true);
    setIsModalOpen(true);
  };

  const handleBookClick = (hotel) => {
    setSelectedHotel(hotel);
    setViewOnly(false);
    setIsModalOpen(true);
  };

  const completeBooking = (hotelId) => {
    setHotelsData(prevHotels => 
      prevHotels.map(item => {
        if (item.id === hotelId) {
          return { ...item, available: false };
        }
        return item;
      })
    );
  };

  if (loading) return <div className="loading">Loading our finest retreats...</div>;

  return (
    <section className="featured-section" id="hotels">
      <div className="section-header">
        <h4 className="sub-title">EXPLORE OUR PROPERTIES</h4>
        <h2 className="main-title">Our Featured Hotels</h2>
        {filteredRooms && filteredRooms.length > 0 && (
          <p className="search-results-count">
            Found {filteredRooms.length} room(s)
            {onClearSearch && (
              <button 
                className="clear-search-btn"
                onClick={onClearSearch}
              >
                Clear Search
              </button>
            )}
          </p>
        )}
      </div>

      <div className="hotel-grid">
        {displayRooms.map((hotel) => (
          <div 
            key={hotel.id} 
            ref={el => roomRefs.current[hotel.id] = el}
            className={`hotel-card ${selectedRoomId === hotel.id ? 'highlight-glow' : ''}`}
          >
            <div className="image-container">
              <img src={hotel.img} alt={hotel.name} className="hotel-img" />
              <span className="price-tag">Ksh {hotel.price} / night</span>
            </div>

            <div className="hotel-details">
              <h3 className="hotel-name">{hotel.name}</h3>
              <p className="hotel-location">📍 {hotel.location || "Location not specified"}</p>
              <p className="hotel-type" style={{color: '#888', fontSize: '0.9rem'}}>{hotel.type}</p>
              <p className="hotel-beds">{hotel.beds}</p>
              
              <div className="card-actions">
                <button className="view-details-btn" onClick={() => handleViewDetails(hotel)}>View Details</button>
                <button 
                  className="book-btn"
                  disabled={!hotel.available}
                  onClick={() => handleBookClick(hotel)}
                >
                  {hotel.available ? "Book Now" : "Sold Out"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayRooms.length === 0 && (
        <div className="no-results">
          <p>No rooms found matching your search criteria.</p>
          {onClearSearch && (
            <button 
              className="clear-search-btn"
              onClick={onClearSearch}
            >
              Show All Rooms
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <BookNowModal 
          hotel={selectedHotel} 
          viewOnly={viewOnly} 
          onClose={() => setIsModalOpen(false)} 
          onConfirm={() => completeBooking(selectedHotel.id)}
        />
      )}
    </section>
  );
};

export default FeaturedHotel;