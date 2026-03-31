import React, { useState } from 'react';
import './AdminLayout.css';
import './Sidebar.css';
const Sidebar = ({ onLogout, activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {!isCollapsed && (
            <>
              <h1>VestaStay</h1>
              <span>Admin Panel</span>
            </>
          )}
        </div>
        {/* The Three Dashes (Hamburger Menu) */}
        <button className="toggle-btn" onClick={toggleSidebar}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
          >
            <span className="icon">📊</span> 
            {!isCollapsed && <span className="label">Dashboard</span>}
          </li>
          <li 
            className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
            title="Room Management"
          >
            <span className="icon">🛏️</span> 
            {!isCollapsed && <span className="label">Room Management</span>}
          </li>
          <li 
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
            title="Bookings"
          >
            <span className="icon">📅</span> 
            {!isCollapsed && <span className="label">Bookings</span>}
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          {isCollapsed ? '🚪' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;