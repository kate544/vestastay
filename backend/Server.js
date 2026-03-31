import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- CLEAN CREDENTIALS ---
// We scrub the keys here just in case they were copied with invisible spaces
const consumerKey = process.env.MPESA_CONSUMER_KEY?.replace(/\s/g, '');
const consumerSecret = process.env.MPESA_CONSUMER_SECRET?.replace(/\s/g, '');
const passkey = process.env.MPESA_PASSKEY?.replace(/\s/g, '');

const getAccessToken = async () => {
    try {
        console.log("🚀 Vesta Handshake: Initializing...");
        
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: { 
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/json" 
                }
            }
        );

        console.log("✅ Vesta Handshake: SUCCESS!");
        return response.data.access_token;
    } catch (error) {
        // This will print the exact reason Safaricom is giving a 400
        console.error("❌ Handshake Failed:", error.response?.data || error.message);
        return null;
    }
};

app.post('/stkpush', async (req, res) => {
    const { phoneNumber, amount } = req.body;
    const token = await getAccessToken();

    if (!token) return res.status(500).json({ error: "Auth Failed" });

    const shortCode = "174379"; 
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    try {
        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: Math.round(amount),
                PartyA: phoneNumber,
                PartyB: shortCode,
                PhoneNumber: phoneNumber,
                CallBackURL: "https://webhook.site/ab852655-5dec-49c7-b3fa-89986ee4761c",
                AccountReference: "VestaStay",
                TransactionDesc: "Payment"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ STK Push Sent!");
        res.status(200).json(response.data);
    } catch (error) {
        console.error("❌ STK Push Error:", error.response?.data || error.message);
        res.status(500).json({ error: "STK Push Failed" });
    }
});

app.listen(5000, () => console.log("🔥 Vesta Server Live on 5000"));