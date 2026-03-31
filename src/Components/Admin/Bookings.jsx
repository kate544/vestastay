import React, { useEffect } from 'react';
import './Bookings.css';

const Bookings = ({ bookings, setBookings, setRooms, role }) => {
  // Base URL for the bookings API
  const API_BASE_URL = 'http://localhost:7000/api/bookings';

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Fetching directly from the base URL to get the list
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        setBookings(data); 
      } catch (error) {
        console.error("❌ Error loading bookings:", error);
      }
    };
    fetchBookings();
  }, [setBookings]);

  /**
   * DISPLAY ID HELPER
   * Extracts the last 4 characters of the ID for a clean UI look.
   */
  const getDisplayID = (booking) => {
    const rawId = (booking.id && booking.id !== "No field") ? booking.id : booking._id;
    if (!rawId) return "#VST-0000";
    
    const cleanId = rawId.toString().replace('VST-', '');
    const suffix = cleanId.slice(-4).toUpperCase();
    return `#VST-${suffix}`;
  };

  const updateBookingStatus = async (mongoId, newStatus, roomName) => {
    if (!mongoId) return alert("System Error: MongoDB _id not found.");

    try {
      // FIX: Added the forward slash '/' between URL and ID
      const updateUrl = `${API_BASE_URL}/${mongoId}`;
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${response.status}`);
      }

      // Handle room status updates if checked out
      if (newStatus === 'Checked Out') {
        // Ensure your backend has a /api/rooms route if using this
        await fetch(`http://localhost:7000/api/rooms/${roomName}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Dirty' })
        });
        
        setRooms(prevRooms => 
          prevRooms.map(room => room.name === roomName ? { ...room, status: 'Dirty' } : room)
        );
      }

      setBookings(prevBookings => 
        prevBookings.map(b => b._id === mongoId ? { ...b, status: newStatus } : b)
      );
    } catch (error) {
      console.error("❌ Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const cancelBooking = async (mongoId) => {
    if (!mongoId) return;
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      try {
        // FIX: Added the forward slash '/' between URL and ID
        const response = await fetch(`${API_BASE_URL}/${mongoId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setBookings(bookings.filter(b => b._id !== mongoId));
        }
      } catch (error) {
        console.error("❌ Error deleting booking:", error);
      }
    }
  };

  const printBooking = (booking) => {
    const paymentMethod = booking.method || 'Not Specified';
    const displayId = getDisplayID(booking);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Receipt - ${displayId}</title></head>
        <body style="font-family: Arial; padding: 40px;">
          <h1 style="color: #003580;">VestaStay Receipt</h1>
          <hr/>
          <p><strong>Booking ID:</strong> ${displayId}</p>
          <p><strong>Guest:</strong> ${booking.guest}</p>
          <p><strong>Room:</strong> ${booking.room}</p>
          <p><strong>Total:</strong> KES ${booking.amount?.toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h3>Live Reservations</h3>
        <p>Monitor guest bookings and payment status in real-time.</p>
      </div>

      <div className="bookings-table-wrapper">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest Name</th>
              <th>Room Type</th>
              <th>Total (KES)</th>
              <th>Payment</th>
              <th>Stay Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings && bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="booking-id">{getDisplayID(booking)}</td>
                  <td>{booking.guest}</td>
                  <td>{booking.room}</td>
                  <td className="booking-amount">{booking.amount?.toLocaleString()}</td>
                  <td>
                    <span className={`method-badge ${(booking.method || 'card').toLowerCase()}`}>
                      {booking.method?.toUpperCase() || "CARD"}
                    </span>
                  </td>
                  <td>{booking.date}</td>
                  <td>
                    <span className={`status-badge ${booking.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="view-details-btn" onClick={() => printBooking(booking)}>Print</button>
                    {booking.status === 'Confirmed' && (
                      <button className="checkin-btn" onClick={() => updateBookingStatus(booking._id, 'Checked In', booking.room)}>Check-in</button>
                    )}
                    {booking.status === 'Checked In' && (
                      <button className="checkout-btn" onClick={() => updateBookingStatus(booking._id, 'Checked Out', booking.room)}>Check-out</button>
                    )}
                    {role === 'admin' && (
                      <button className="cancel-btn" onClick={() => cancelBooking(booking._id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No active bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;