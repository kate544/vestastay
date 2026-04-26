import React, { useState, useEffect } from 'react';
import './RoomManagement.css';

const RoomManagement = ({ role }) => {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: '',
    price: '',
    quantity: 1,
    details: '',
    image: null,
    numofGuests: 1
  });

  const API_URL = 'http://localhost:7000/api/rooms';

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRooms([]);
    }
  };

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
     console.log(`Field changed: ${name} = ${value}`);
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setFormData({ ...formData, image: compressed });
      } catch (err) {
        console.error("Compression failed:", err);
      }
    }
  };

  const openAddModal = () => {
    setEditingRoomId(null);
    setFormData({ 
      name: '', 
      location: 'Nairobi', 
      type: '', 
      price: '', 
      quantity: 1, 
      details: 'Free Wifi • Breakfast & Dinner Included', 
      image: null, 
      numofGuests: 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoomId(room._id);
    setFormData({
      name: room.name,
      location: room.location || 'Nairobi',
      type: room.type,
      price: room.price,
      quantity: room.quantity || 1,
      details: room.details || '',
      image: room.image,
      numofGuests: room.numofGuests || 1 // FIXED: Added this line
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingRoomId ? 'PUT' : 'POST';
    const url = editingRoomId ? `${API_URL}/${editingRoomId}` : API_URL;
    
    // Create a clean data object with ALL required fields
    const roomData = {
      name: formData.name,
      location: formData.location,
      type: formData.type,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      details: formData.details,
      numofGuests: Number(formData.numofGuests), // Make sure this is included
      status: formData.status || 'Available',
      image: formData.image || null
    };

   console.log("Sending data to backend:", roomData); // Check if location appears here

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchRooms();
        alert(editingRoomId ? "Room updated successfully!" : "Room added successfully!");
      } else {
        const errorData = await response.json();
        console.error("Server rejected data:", errorData);
        alert(`Error: ${errorData.message || errorData.error || 'Check your inputs'}`);
      }
    } catch (err) {
      console.error("Error saving room:", err);
      alert("Network error. Check if backend is running.");
    }
  };

  const deleteRoom = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchRooms();
      } catch (err) {
        console.error("Error deleting room:", err);
      }
    }
  };

  const toggleStatus = async (room) => {
    const newStatus = room.status === 'Available' ? 'Cleaning' : 'Available';
    const originalRooms = [...rooms];
    setRooms(rooms.map(r => r._id === room._id ? { ...r, status: newStatus } : r));

    try {
      const response = await fetch(`${API_URL}/${room._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...room,
          status: newStatus 
        }),
      });

      if (!response.ok) {
        throw new Error("Server rejected the update");
      }
    } catch (err) {
      console.error("Toggle failed:", err);
      setRooms(originalRooms);
      alert("Database update failed. Check if your Backend is running.");
    }
  };

  return (
    <div className="room-management">
      <div className="table-header">
        <h3>Room Inventory (Live Database)</h3>
        {role === 'admin' && (
          <button className="add-room-btn" onClick={openAddModal}>+ Add New Room</button>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{editingRoomId ? 'Edit Room' : 'Add New Room'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Room Name</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <select name="location" value={formData.location} onChange={handleInputChange} required>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Nakuru">Nakuru</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Room Type</label>
                <input name="type" value={formData.type} onChange={handleInputChange} required />
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Price (KES)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required min="0" />
                </div>
              </div>

              {/* Number of Guests - Only once! */}
              <div className="form-group">
                <label>Number of Guests</label>
                <input 
                  type="number" 
                  name="numofGuests" 
                  value={formData.numofGuests} 
                  onChange={handleInputChange} 
                  required 
                  min="1"
                  max="10"
                  placeholder="Maximum guests allowed"
                />
              </div>

              <div className="form-group">
                <label>Amenities & Details</label>
                <textarea name="details" value={formData.details} onChange={handleInputChange} rows="2" />
              </div>

              <div className="form-group">
                <label>Room Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {formData.image && <img src={formData.image} alt="Preview" className="img-preview" style={{ height: '80px', marginTop: '10px' }} />}
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn">{editingRoomId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="room-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Room Info</th>
            <th>Location</th>
            <th>Type</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room._id}>
              <td>
                {room.image ? <img src={room.image} alt="room" className="room-thumb" /> : <div className="no-img">No Image</div>}
              </td>
              <td>
                <div style={{ fontWeight: 'bold' }}>{room.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{room.details}</div>
              </td>
              <td style={{ fontWeight: '500' }}>
  {room.location || room.city || room.hotelLocation || room.area || 'N/A'}
</td>
              <td>{room.type}</td>
              <td>{room.price?.toLocaleString()}</td>
              <td style={{ color: room.quantity < 3 ? 'red' : 'green', fontWeight: 'bold' }}>
                {room.quantity} left
              </td>
              <td>
                <span className={`status-pill ${room.status?.toLowerCase()}`}>
                  {room.status}
                </span>
              </td>
              <td>
                <button className="status-toggle-btn" onClick={() => toggleStatus(room)}>Toggle</button>
                {role === 'admin' && (
                  <>
                    <button className="admin-edit-btn" onClick={() => openEditModal(room)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteRoom(room._id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomManagement;