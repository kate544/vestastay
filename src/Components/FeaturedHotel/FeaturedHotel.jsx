import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './FeaturedHotel.css';
import BookNowModal from '../BookNowModal/BookNowModal';

const FeaturedHotel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [viewOnly, setViewOnly] = useState(false); 
  const [hotelsData, setHotelsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time room data from the database
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:7000/api/rooms");
        // Map database fields to the component's expected format
        const formattedRooms = response.data.map(room => ({
          id: room._id, // Use MongoDB _id
          name: room.name,
          type: room.type,
          price: room.price.toLocaleString(), // Format price with commas
          available: room.status === "Available",
          // Fallback if no image is provided in DB
          img: room.image || "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg",
          beds: room.type === "Executive Room" 
            ? "Living Area • All meals • Free Wifi • Swimming Pool" 
            : " Free Wifi • Breakfast & Dinner Included"
        }));
        setHotelsData(formattedRooms);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching rooms for Featured section:", error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

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

  // Note: Booking confirmation logic should ideally update the backend status
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
      </div>

      <div className="hotel-grid">
        {hotelsData.map((hotel) => (
          <div key={hotel.id} className="hotel-card">
            <div className="image-container">
              <img src={hotel.img} alt={hotel.name} className="hotel-img" />
              <span className="price-tag">Ksh {hotel.price} / night</span>
            </div>

            <div className="hotel-details">
              <h3 className="hotel-name">{hotel.name}</h3>
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