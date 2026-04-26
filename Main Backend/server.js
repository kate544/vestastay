const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors()); 

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// --- GMAIL NOTIFICATION CONFIGURATION ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error) => {
  if (error) {
    console.log("❌ Email Service Error:", error.message);
  } else {
    console.log("📧 Email Service Ready: VestaStay is live!");
  }
});

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ VestaStay Main Database Connected!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- BOOKING SCHEMA & MODEL ---
const bookingSchema = new mongoose.Schema({
  id: { type: String, unique: true }, 
  guest: { type: String, required: true },
  email: { type: String, required: true }, 
  phone: String,
  room: String,
  amount: Number,
  date: String,
  numofGuests: Number,
  status: { type: String, default: 'Confirmed' },
  method: { type: String, default: 'Card' },
  reference: String 
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

// --- ROOM SCHEMA & MODEL ---
const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  numofGuests: {type:Number, required: true},
  quantity: { type: Number, default: 1 }, // Added quantity
  details: { type: String, default: "Free Wifi • Breakfast & Dinner Included" }, 
  image: String, 
  status: { type: String, default: 'Available' }
}, { timestamps: true });

roomSchema.index({ createdAt: -1 });
const Room = mongoose.model('Room', roomSchema);

// --- ROUTES: BOOKINGS ---

app.get('/api/bookings', async (req, res) => {
  try {
    const data = await Booking.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { id, guest, email, phone, room, amount, date, method, reference } = req.body;
    const numericAmount = typeof amount === 'string' ? Number(amount.replace(/[^0-9.-]+/g, "")) : amount;

    const newBooking = new Booking({
      id: id || reference || `VST-${Math.floor(1000 + Math.random() * 9000)}`, 
      guest, email, phone, room: room || "Vesta Panari", 
      amount: numericAmount,
      date: date || new Date().toLocaleDateString(), 
      method: method || 'Card',
      status: 'Confirmed', 
      reference: reference || id
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(400).json({ message: "Save Failed", error: err.message });
  }
});

const updateBooking = async (req, res) => {
    try {
      const { id } = req.params;
      let updatedBooking = await Booking.findByIdAndUpdate(id, req.body, { new: true });
      
      if (!updatedBooking) {
        updatedBooking = await Booking.findOneAndUpdate({ id: id }, req.body, { new: true });
      }
  
      if (!updatedBooking) return res.status(404).json({ message: "Booking not found" });
      
      console.log(`✅ Booking Status: ${updatedBooking.id} is now ${updatedBooking.status}`);
      res.json(updatedBooking);
    } catch (err) {
      res.status(400).json({ message: "Update failed", error: err.message });
    }
};

app.patch('/api/bookings/:id', updateBooking);
app.put('/api/bookings/:id', updateBooking);

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const result = await Booking.findByIdAndDelete(req.params.id) || 
                   await Booking.findOneAndDelete({ id: req.params.id });
    
    if (!result) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ROUTES: ROOM MANAGEMENT ---

app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }).allowDiskUse(true);
    res.json(rooms);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Logic: Automatically update status based on quantity
    if (updateData.quantity !== undefined) {
      updateData.status = updateData.quantity > 0 ? 'Available' : 'Sold Out';
    }

    let roomRecord = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      roomRecord = await Room.findByIdAndUpdate(id, updateData, { new: true });
    }

    if (!roomRecord) {
      roomRecord = await Room.findOneAndUpdate(
        { name: decodeURIComponent(id) }, 
        updateData, 
        { new: true }
      );
    }

    if (!roomRecord) return res.status(404).json({ message: "Room not found" });
    
    console.log(`🏠 Room Update: ${roomRecord.name} (Qty: ${roomRecord.quantity}) is ${roomRecord.status}`);
    res.json(roomRecord);
  } catch (err) {
    res.status(400).json({ message: "Invalid update data", error: err.message });
  }
};

app.patch('/api/rooms/:id', updateRoom);
app.put('/api/rooms/:id', updateRoom);
// In your backend, add this temporary route to fix existing rooms
app.put('/api/rooms/fix-location/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;
    const room = await Room.findByIdAndUpdate(id, { location }, { new: true });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post('/api/rooms', async (req, res) => {
  try {
    // If adding a room with 0 quantity, set status to Sold Out automatically
    const roomData = req.body;
    if (roomData.quantity <= 0) roomData.status = 'Sold Out';

    const newRoom = new Room(roomData);
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (err) { res.status(400).json({ message: "Failed to add room", error: err.message }); }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const result = await Room.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`🚀 VestaStay Server on http://localhost:${PORT}`));