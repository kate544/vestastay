import React, { useState } from "react";
import ReactDOM from "react-dom"; 
import "./BookNowModal.css";
import MpesaPayment from "../MpesaPayment/MpesaPayment"; 
import PaystackPayment from "../PaystackPayment/PaystackPayment";

function BookNowModal({ hotel, onClose, onConfirm, viewOnly }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", requests: "", checkIn: "", checkOut: "", guests: 1,
  });

  const [success, setSuccess] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0); 
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false); 

  if (!hotel) return null;

  // 1. Calculations
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const currentTotal = (() => {
    const inDate = parseDate(form.checkIn);
    const outDate = parseDate(form.checkOut);
    const nights = inDate && outDate ? (outDate - inDate) / 86400000 : 0;
    const pricePerNight = Number(String(hotel.price).replace(/[^0-9.]/g, "")) || 0;
    return nights > 0 ? nights * pricePerNight * form.guests : 0;
  })();

  // 2. Handlers
  const saveBookingToDatabase = async () => {
    const method = paymentMethod === "mpesa" ? "M-Pesa" : "Card";
    const newBooking = {
      id: `VS-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
      guest: form.name, email: form.email, phone: form.phone,
      room: hotel.name, amount: Number(currentTotal),
      checkIn: form.checkIn, checkOut: form.checkOut,
      guests: form.guests, date: new Date().toLocaleDateString("en-GB"),
      status: "Confirmed", method: method,
    };

    try {
      const response = await fetch("http://localhost:7000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      if (response.ok) {
        onConfirm(); 
        setFinalTotal(currentTotal); 
        setSuccess(true);
        return true;
      } else {
        const result = await response.json();
        alert(`Failed: ${result.error || "Save Failed"}`);
        return false;
      }
    } catch (error) {
      alert("Backend server not connected.");
      return false;
    }
  };

  const handlePaymentSuccess = async () => {
    setPaymentSuccess(true); 
    return await saveBookingToDatabase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "guests" ? Number(value) : value });
  };

  const handleBackFromPayment = () => {
    setActivePayment(null);
    setPaymentSuccess(false);
  };

  const modalJSX = (
    <div className="modal-overlay">
      <div className="modal-content vesta-theme">
        {!success ? (
          <>
            <h2 className="modal-title">{viewOnly ? "Room Details" : `Book ${hotel.name}`}</h2>
            
            {viewOnly ? (
              <div className="view-details-content">
                <div className="detail-image-wrapper">
                  <img src={hotel.img || hotel.image} alt={hotel.name} className="detail-img" style={{ width: '90%', borderRadius: '8px', marginBottom: '25px' }} />
                </div>
                <div className="detail-info">
                  {/*Location Line using data rom the Admin Portal*/}
                 <p style={{ fontSize: '16px', marginBottom: '10px' }}>
    📍 <b>Location:</b> {hotel.location || "Not Specified"}
  </p>
                  {/* --- STATUS DOT  --- */}
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <b>Category:</b> {hotel.type} 
                    <span style={{ 
                      height: '10px', 
                      fontSize: '10px',
                      width: '10px', 
                      backgroundColor: hotel.available ? '#28a745' : '#dc3545', 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      marginLeft: '5px'
                    }}></span>
                    <span style={{ fontSize: '15px', color: hotel.available ? '#28a745' : '#dc3545' }}>
                      {hotel.available ? "Available" : "Sold Out"}
                    </span>
                  </p>
                  
                  <p><b>Included:</b> {hotel.beds}</p>
                  <p><b>Rate:</b> KES {hotel.price} / night</p>
                <p style={{ marginTop: '20px', color: '#555' }}>
        Welcome to VestaStay. This property offers premium comfort and dedicated service to ensure your stay is memorable.
      </p>
                </div>
                <div className="vesta-actions">
                  <button type="button" onClick={onClose} className="close-btn-flat">Back to Gallery</button>
                </div>
              </div>
            ) : (
              <form className="booking-form">
                <label>Full Name*</label>
                <input name="name" value={form.name} onChange={handleChange} required />
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Email*</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Phone*</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Check-in*</label>
                    <input type="date" name="checkIn" value={form.checkIn} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Check-out*</label>
                    <input type="date" name="checkOut" value={form.checkOut} onChange={handleChange} />
                  </div>
                </div>
<div className="form-row">
  <div className="form-group">
    <label>Number of Guests*</label>
    <input 
      type="number" 
      name="guests" 
      min="1" 
      max="10" 
      value={form.guests} 
      onChange={handleChange} 
      required 
    />
  </div>
</div>


                <div className="price-summary">
                  <p>Total: <b>KES {currentTotal.toLocaleString()}</b></p>
                </div>

                <div className="vesta-actions">
                  <button type="button" className="Payment-btn" onClick={() => setShowPaymentOptions(true)}>
                    Proceed to Payment
                  </button>
                  <button type="button" onClick={onClose} className="close-btn-flat">Close</button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h3>Booking Confirmed!</h3>
            <div className="receipt-card">
              <div className="receipt-row">
                <span>Total Paid:</span> 
                <b>KES {finalTotal.toLocaleString()}</b>
              </div>
              <div className="receipt-row">
                <span>Room:</span> 
                <b>{hotel.name}</b>
              </div>
              <div className="receipt-row">
                <span>Date:</span> 
                <b>{new Date().toLocaleDateString()}</b>
              </div>
            </div>
            <div className="success-actions">
              <button onClick={() => window.print()} className="print-btn">Print Receipt</button>
              <button onClick={onClose} className="close-btn-flat">Finish</button>
            </div>
          </div>
        )}

        {showPaymentOptions && !activePayment && (
          <div className="payment-selection-overlay">
            <div className="payment-selection-card">
              <h3>Select Method</h3>
              <button className="pay-btn" onClick={() => {setActivePayment("mpesa"); setPaymentMethod("mpesa")}}>M-Pesa</button>
              <button className="pay-btn" onClick={() => {setActivePayment("card"); setPaymentMethod("card")}}>Card</button>
              <button  className="cancel-btn" onClick={() => setShowPaymentOptions(false)}>Cancel</button>
            </div>
          </div>
        )}

        {activePayment && (
          <div className="payment-selection-overlay">
            <div className="integration-wrapper">
              {activePayment === "card" ? (
                <PaystackPayment
                  amount={currentTotal} email={form.email} guestName={form.name}
                  onSuccess={handlePaymentSuccess} 
                  onConfirmBooking={saveBookingToDatabase}
                  onClose={onClose}
                />
              ) : (
                <MpesaPayment 
                  initialPhone={form.phone} 
                  initialAmount={currentTotal}
                  hotelName={hotel.name}
                  guestName={form.name}
                  email={form.email}
                  onSuccess={handlePaymentSuccess} 
                  onClose={onClose}
                />
              )}
              {!paymentSuccess && (
                <button className="back-btn-center" onClick={handleBackFromPayment}>← Back</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalJSX, document.body);
}

export default BookNowModal;