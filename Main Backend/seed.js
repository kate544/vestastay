const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🌱 Seed Connection Successful!"))
  .catch(err => console.error("❌ Seed Connection Error:", err));

// An updated Schema matches server.js and MongoDB Compass data
const bookingSchema = new mongoose.Schema({
  id: String,
  guest: { type: String, required: true },
  email: { type: String, required: true }, 
  room: String,
  amount: Number,
  date: String,
  status: { type: String, default: 'Confirmed' },
  method: { type: String, default: 'Not Specified' },
  reference: String // for Paystack/M-Pesa tracking
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

const initialBookings = [
  { 
    id: 'VST-8821', 
    guest: 'Kathryn Tokoli', 
    email: 'kathryn@example.com',
    room: 'Executive Suite', 
    amount: 28500, 
    date: '2026-03-12', 
    status: 'Confirmed', 
    method: 'Card',
    reference: 'REF-KT-123'
  },
  { 
    id: 'VST-8822', 
    guest: 'John Doe', 
    email: 'john@example.com',
    room: 'Deluxe Room', 
    amount: 20000, 
    date: '2026-03-15', 
    status: 'Confirmed', 
    method: 'M-Pesa',
    reference: 'MP-JD-456'
  }
];

const seedDB = async () => {
  try {
    // This prevents duplicates while KEEPING your new app bookings
    for (const item of initialBookings) {
      await Booking.updateOne(
        { id: item.id }, 
        { $set: item }, 
        { upsert: true } 
      );
    }
    
    console.log("✅ Seed data synced without deleting your new bookings!");
    process.exit(); 
  } catch (err) {
    console.error("❌ Seed Logic Error:", err);
    process.exit(1);
  }
};

seedDB();