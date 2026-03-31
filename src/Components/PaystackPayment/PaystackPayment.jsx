import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack'; 
import './PaystackPayment.css';

const generateReference = () => "VS-" + Date.now() + Math.floor(Math.random() * 100);

const PaystackPayment = ({ amount, email, phone, guestName, onSuccess, onClose, bookingData, onConfirmBooking }) => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [showConfirmButton, setShowConfirmButton] = useState(false); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const cleanAmount = (val) => {
        if (typeof val === 'string') return Number(val.replace(/[^0-9.-]+/g, ""));
        return val || 0;
    };

    const [localAmount] = useState(cleanAmount(amount));

    const [formData, setFormData] = useState({ 
        name: guestName || '', 
        number: '', 
        expiry: '', 
        cvv: '' 
    });
    const [cardType, setCardType] = useState('mastercard');

    const config = {
        reference: generateReference(),
        email: email || "guest@vestastay.com",
        amount: Math.floor(localAmount * 100),
        publicKey: 'pk_test_b37e66ac97b443926cc3800b07b40fae9cb665b3', 
        currency: 'KES',
    };

    const initializePayment = usePaystackPayment(config);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let val = value;
        if (name === 'name') val = value.toUpperCase();
        if (name === 'number') {
            val = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().substring(0, 19);
            setCardType(val.startsWith('4') ? 'visa' : 'mastercard');
        }
        setFormData({ ...formData, [name]: val });
        setError(null);
    };

    const onSuccessCallback = async (response) => {
        setIsSuccess(true);
        setShowConfirmButton(true);
        setReceiptData(response);
        setIsProcessing(true);
        
        if (typeof onSuccess === 'function') {
            try {
                await onSuccess(response);
            } catch (err) {
                console.error("❌ Processing error:", err);
                setError("Payment verified, but system update failed.");
            }
        }
        setIsProcessing(false);
    };

    const handlePayment = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) { setError("Enter Cardholder Name."); return; }
        if (!formData.number.trim() || formData.number.length < 15) { setError("Invalid Card Number."); return; }
        
        setError(null);
        setShowConfirmButton(true); // Button appears immediately

        try {
            initializePayment(onSuccessCallback, onClose);
        } catch (err) {
            setError("Payment window failed to open.");
            setShowConfirmButton(false);
        }
    };

    const handleConfirmBooking = () => {
        if (onConfirmBooking) onConfirmBooking(); 
        alert("Booking Confirmed!");
        if (onClose) onClose(); 
    };

    const logos = {
        mastercard: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
        visa: "https://upload.wikimedia.org/wikipedia/commons/8/81/Visa_Brandmark_2021.svg"
    };

    if (isSuccess) {
        return (
            <div className="payment-container">
                <div className="success-box">
                    <div className="check-icon">✓</div>
                    <h2>Payment Successful!</h2>
                    <p>Processed: <strong>KES {localAmount.toLocaleString()}</strong></p>
                    <div className="receipt-details">
                        <div className="receipt-row">
                            <span>Reference:</span> <span className="ref-text">{receiptData?.reference}</span>
                        </div>
                    </div>
                    {bookingData && (
                        <div className="booking-summary-card">
                            <h3>Review your booking</h3>
                            <div className="booking-summary-details">
                                <p><strong>Hotel:</strong> {bookingData.hotelName}</p>
                                <p><strong>Guest:</strong> {bookingData.guestName}</p>
                            </div>
                        </div>
                    )}
                    <button 
                        className="confirm-booking-btn" 
                        onClick={handleConfirmBooking} 
                        style={{ backgroundColor: '#28a745', cursor: 'pointer' }}
                    >
                        Confirm & Complete Booking
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-container">
            <div className="visa-card">
                <div className="chip"></div>
                <div className="card-number-display">{formData.number || "•••• •••• •••• ••••"}</div>
                <div className="card-bottom-row">
                    <div className="info-group"><span>CARD HOLDER</span><p>{formData.name || "NAME"}</p></div>
                    <div className="info-group"><span>EXPIRES</span><p>{formData.expiry || "MM/YY"}</p></div>
                </div>
            </div>
            <div className="form-box">
                {isProcessing ? <div className="spinner"></div> : (
                    <>
                        <div className="order-summary">Total: <strong>KES {localAmount.toLocaleString()}</strong></div>
                        {error && <div className="error-message">⚠️ {error}</div>}
                        <div className="field"><label>Name</label><input name="name" value={formData.name} onChange={handleInputChange} /></div>
                        <div className="field">
                            <label>Card Number</label>
                            <div className="input-with-logo">
                                <input name="number" value={formData.number} onChange={handleInputChange} />
                                <img src={logos[cardType]} alt="card logo" className="brand-logo" />
                            </div>
                        </div>
                        <div className="row-split">
                            <div className="field"><label>Expiry</label><input name="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleInputChange} /></div>
                            <div className="field"><label>CVV</label><input name="cvv" type="password" value={formData.cvv} onChange={handleInputChange} /></div>
                        </div>
                        
                        <button className="pay-btn" onClick={handlePayment}>Pay Now</button>

                        {showConfirmButton && (
                            <button 
                                className="confirm-booking-btn" 
                                onClick={handleConfirmBooking}
                                style={{ 
                                    opacity: 1, 
                                    cursor: 'pointer',
                                    backgroundColor: '#28a745',
                                    marginTop: '15px'
                                }}
                            >
                                Confirm & Complete Booking
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PaystackPayment;