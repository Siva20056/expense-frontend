import React, { useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from 'axios';

// 1. YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDjRxy12Xkj4-KnX_sSHX1WRFkugmVdI9s", // Make sure no spaces at start/end
  authDomain: "expensetracker-88238.firebaseapp.com",
  projectId: "expensetracker-88238",
  storageBucket: "expensetracker-88238.firebasestorage.app",
  messagingSenderId: "439768067582",
  appId: "1:439768067582:web:1859f7f92a35bbeed8e4af",
  measurementId: "G-FY9JNMXMQV"
};

// 2. INITIALIZE FIREBASE (Fixed)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // <--- YOU WERE MISSING THIS LINE!

// 3. YOUR BACKEND URL (Fixed trailing slash)
const API_URL = "https://expense-backend-bcd9.onrender.com"; 

export default function App() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [confirmObj, setConfirmObj] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const sendOtp = async () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    }
    try {
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmObj(confirmation);
      alert("OTP Sent!");
    } catch (e) { 
      console.error(e); 
      alert("Error: " + e.message); 
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await confirmObj.confirm(otp);
      setUser(res.user);
      fetchExpenses(res.user.phoneNumber);
    } catch (e) { alert("Invalid OTP"); }
  };

  const fetchExpenses = async (ph) => {
    try {
      const res = await axios.get(`${API_URL}/api/expenses?phone=${ph}`);
      setExpenses(res.data);
    } catch (error) { console.error("Fetch error:", error); }
  };

  if (!user) return (
    <div style={{padding: 20}}>
      <h2>Login</h2>
      {!confirmObj ? (
        <>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91..." />
          <button onClick={sendOtp}>Send OTP</button>
          <div id="recaptcha-container"></div>
        </>
      ) : (
        <>
          <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="OTP" />
          <button onClick={verifyOtp}>Verify</button>
        </>
      )}
    </div>
  );

  return (
    <div style={{padding: 20}}>
      <h2>My Expenses</h2>
      <button onClick={() => fetchExpenses(user.phoneNumber)}>Refresh</button>
      <ul>
        {expenses.map(e => (
          <li key={e._id}>
            <b>{e.merchant}</b>: ₹{e.amount} <small>({e.category})</small>
          </li>
        ))}
      </ul>
    </div>
  );
}