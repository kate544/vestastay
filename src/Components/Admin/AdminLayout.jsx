import React, { useState } from 'react';
import './AdminLayout.css';
import Sidebar from './Sidebar';
import RoomManagement from './RoomManagement';
import Bookings from './Bookings';

const Dashboard = ({ rooms, bookings, role }) => {
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const availableRooms = rooms.filter(r => r.status === 'Available').length;

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card">
          <h4>{role === 'admin' ? "Total Revenue" : "Today's Collection"}</h4>
          <p className="stat-value">KES {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h4>Available Rooms</h4>
          <p className="stat-value">{availableRooms}</p>
        </div>
        <div className="stat-card">
          <h4>Active Bookings</h4>
          <p className="stat-value">{bookings.length}</p>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Reservations</h3>
        <p>You have {bookings.length} active bookings in the system.</p>
      </div>
    </div>
  );
};

const AdminLayout = ({ onLogout, bookings, setBookings, rooms, setRooms, role }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'rooms':
        return <RoomManagement rooms={rooms} setRooms={setRooms} role={role} />;
      
      case 'bookings':
        // Correctly passing all props to Bookings component
        return (
          <Bookings 
            bookings={bookings} 
            setBookings={setBookings} 
            setRooms={setRooms} 
            role={role} 
          />
        );
        
      default:
        return <Dashboard rooms={rooms} bookings={bookings} role={role} />;
    }
  };

  return (
    <div className="admin-wrapper">
      <Sidebar 
        onLogout={onLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={role} 
      />
      <div className="admin-main-content">
        <header className="admin-header">
          <h2>VestaStay Management Portal</h2>
          <div className="admin-profile">
            <span>{role === 'admin' ? 'Admin Control' : 'Manager Operations'}</span>
          </div>
        </header>
        <div className="admin-page-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;