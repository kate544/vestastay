import React, { useState } from "react";
import axios from "axios";
import "./MpesaPayment.css";

const MpesaPayment = ({ initialPhone, initialAmount, hotelName, guestName, email, onSuccess, onClose }) => {
    const [phone, setPhone] = useState(initialPhone || "");
    const [status, setStatus] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [receiptDetails, setReceiptDetails] = useState(null);

    const handlePayment = async () => {
        setStatus("Sending Prompt...");
        
        let formattedPhone = phone.replace(/\+/g, ""); 
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "254" + formattedPhone.substring(1);
        }

        try {
            // 1. Trigger the STK Push via your M-Pesa Service
            const { data } = await axios.post("http://localhost:5000/stkpush", {
                phoneNumber: formattedPhone, 
                amount: Math.round(initialAmount)
            });
            
            console.log("Mpesa Response:", data); 
            setStatus("Check your phone! ✅");
            
            const rawId = data.CheckoutRequestID || Math.random().toString(36).toUpperCase().substring(2, 12);
            const shortId = rawId.length > 10 ? rawId.substring(rawId.length - 10) : rawId;

            // Create full booking object to pass to parent
            const bookingData = {
                guest: guestName || "M-Pesa User",
                email: email || "",
                phone: formattedPhone,
                amount: initialAmount,
                method: "M-Pesa",
                reference: `VS-${shortId}`,
                status: "Confirmed",
                hotelName: hotelName
            };

            console.log("📝 Calling parent onSuccess with booking data:", bookingData);

            // 2. Trigger the callback to the Modal with full booking data
            if (onSuccess) {
                const wasSaved = await onSuccess(bookingData);
                if (wasSaved) {
                    // Prepare receipt details for this local view
                    const receiptInfo = {
                        receiptNo: `VS-${shortId}`,
                        amount: initialAmount,
                        phone: formattedPhone,
                        date: new Date().toLocaleString(), 
                        method: "M-Pesa"
                    };
                    setReceiptDetails(receiptInfo);
                    // Auto-show receipt after a brief delay
                    setTimeout(() => setIsSuccess(true), 2000);
                } else {
                    setStatus("Error: Payment successful but booking not saved");
                }
            }
            
        } catch (error) {
            console.error("Payment Error:", error);
            setStatus("Error: Server not responding. Please try again."); 
        }
    };

    const handlePrint = () => {
        window.print(); 
    };

    if (isSuccess && receiptDetails) {
        return (
            <div className="mpesa-card success-view">
                <div className="success-icon" style={{fontSize: "2rem", marginBottom: "10px"}}>✅</div>
                <h3 className="success-title">Payment Successful!</h3>
                <p>Your booking with <strong>{hotelName}</strong> is confirmed.</p>
                
                <div className="receipt-card">
                    <div className="receipt-row">
                        <span>Receipt No:</span> <strong>{receiptDetails.receiptNo}</strong>
                    </div>
                    <div className="receipt-row">
                        <span>Amount:</span> <strong>KES {receiptDetails.amount.toLocaleString()}</strong>
                    </div>
                    <div className="receipt-row">
                        <span>Phone:</span> <strong>{receiptDetails.phone}</strong>
                    </div>
                    <div className="receipt-row">
                        <span>Date:</span> <strong>{receiptDetails.date}</strong>
                    </div>
                    <div className="receipt-row">
                        <span>Method:</span> <strong>{receiptDetails.method}</strong>
                    </div>
                </div>

                <div className="receipt-actions">
                    <button onClick={handlePrint} className="print-btn">Print receipt</button>
                    <button onClick={onClose} className="close-btn-flat">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="mpesa-card">
            <h2 className="mpesa-header">Pay <span>for {hotelName}</span> Booking</h2>
            <div className="header-accent"></div>

            <div className="mpesa-field">
                <label>Phone Number</label>
                <input 
                    type="tel" 
                    className="glow-input"
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="0712345678"
                    required
                />
            </div>

            <div className="mpesa-field">
                <label>Amount (KES)</label>
                <input 
                    type="text" 
                    className="glow-input"
                    value={initialAmount} 
                    readOnly 
                />
            </div>

            <button onClick={handlePayment} className="mpesa-submit-btn">
                1. Send M-Pesa Prompt
            </button>

            {status && (
                <div className={`mpesa-status ${status.includes("Error") ? "error-text" : ""}`}>
                    {status}
                </div>
            )}
        </div>
    );
};

export default MpesaPayment;