import React, { useState, useEffect } from 'react';
import Navbar from './Components/Navbar/Navbar.jsx';
import Hero from './Components/Hero/Hero';
import FeaturedHotel from './Components/FeaturedHotel/FeaturedHotel';
import Experience from './Components/Experience/Experience';
import Testimonials from './Components/Testimonials/Testimonials';
import Newsletter from './Components/Newsletter/Newsletter';
import Footer from './Components/Footer/Footer';
import MpesaPayment from './Components/MpesaPayment/MpesaPayment';
import PaystackPayment from './Components/PaystackPayment/PaystackPayment'; 
import Login from './Components/Login/Login'; 
import AdminLayout from './Components/Admin/AdminLayout.jsx';
import './App.css';

const App = () => {
  const [role, setRole] = useState(null); 
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa'); 
  const [bookings, setBookings] = useState([]);
  
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Executive Room', price: 10000, status: 'Available', type: 'King Bed' },
    { id: 2, name: 'Deluxe Room', price: 20000, status: 'Sold Out', type: 'King Bed' },
    { id: 3, name: 'Single Room', price: 9500, status: 'Available', type: 'Twin Bed' },
    { id: 4, name: 'Family Suite', price: 25000, status: 'Available', type: '1 King Bed' },
    { id: 5, name: 'Executive Suite', price: 30000, status: 'Available', type: '1 King Bed' },
  ]);

  const hotelName = "Vesta Panari";
  const userEmail = "guest@vestastay.com"; 

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('http://localhost:7000/api/bookings');
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("❌ Error fetching from MongoDB:", error);
      }
    };
    fetchBookings();
  }, []);

  const handleLogout = () => {
    setRole(null);
    setIsPaymentOpen(false);
  };

  // FIXED: Now correctly maps reference to id for the backend
  const handleNewBooking = async (bookingData) => {
    console.log("📡 App.jsx received booking signal:", bookingData);

    try {
      const payload = {
        // FIX: Map 'reference' from Paystack to the 'id' field the server expects
        id: bookingData.reference || `VST-${Math.floor(1000 + Math.random() * 9000)}`,
        guest: bookingData.guest || "Guest User",
        email: bookingData.email || userEmail,
        room: hotelName,
        amount: bookingData.amount,
        date: new Date().toLocaleDateString(), 
        method: bookingData.method || "Card",
        status: "Confirmed",
        reference: bookingData.reference || "N/A"
      };

      console.log("🔍 DATABASE CHECK: Sending this to server:", payload);

      const response = await fetch('http://localhost:7000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const saved = await response.json();
        // Immediately update state so the Admin Portal reflects the change
        setBookings(prev => [saved, ...prev]);
        console.log("✅ Successfully saved to MongoDB!", saved);
        return true; 
      } else {
        const errorData = await response.json();
        console.error("❌ Backend rejected booking:", errorData);
        alert("Server error: " + errorData.message); 
        return false;
      }
    } catch (err) {
      console.error("❌ Network or Fetch error:", err);
      return false;
    }
  };

  if (!role) return <Login onLogin={(selectedRole) => setRole(selectedRole)} />;

  if (role === 'admin' || role === 'manager') {
    return (
      <AdminLayout 
        role={role} 
        onLogout={handleLogout} 
        bookings={bookings}      
        setBookings={setBookings} 
        rooms={rooms}              
        setRooms={setRooms}
      />
    );
  }

  return (
    <div className="guest-site">
      <Navbar/>
      <Hero/>
      <FeaturedHotel onBook={() => setIsPaymentOpen(true)}/>
      <Experience/>
      <Testimonials/>
      <Newsletter/>
      <Footer/>
      
      {isPaymentOpen && (
        <div className="payment-overlay">
          <div className="payment-modal-content">
            <button onClick={() => setIsPaymentOpen(false)} className="close-btn">&larr; Go Back</button>
            <div className="method-selector">
                <button 
                  className={paymentMethod === 'M-Pesa' ? 'active' : ''} 
                  onClick={() => setPaymentMethod('M-Pesa')}
                >
                  M-Pesa
                </button>
                <button 
                  className={paymentMethod === 'Card' ? 'active' : ''} 
                  onClick={() => setPaymentMethod('Card')}
                >
                  Credit Card
                </button>
            </div>

            {paymentMethod === 'M-Pesa' ? (
              <MpesaPayment initialAmount={10000} onPaymentSuccess={handleNewBooking} />
            ) : (
              <PaystackPayment 
                amount={10000} 
                email={userEmail}
                onSuccess={handleNewBooking} 
                onClose={() => setIsPaymentOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;