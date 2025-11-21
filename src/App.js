import React, { useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from 'axios';

// REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// REPLACE WITH YOUR RENDER URL
const API_URL = "https://my-expense-api.onrender.com"; 

export default function App() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [confirmObj, setConfirmObj] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const sendOtp = async () => {
    if (!window.recaptchaVerifier) window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    try {
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmObj(confirmation);
      alert("OTP Sent!");
    } catch (e) { console.error(e); alert("Error sending OTP"); }
  };

  const verifyOtp = async () => {
    try {
      const res = await confirmObj.confirm(otp);
      setUser(res.user);
      fetchExpenses(res.user.phoneNumber);
    } catch (e) { alert("Invalid OTP"); }
  };

  const fetchExpenses = async (ph) => {
    const res = await axios.get(`${API_URL}/api/expenses?phone=${ph}`);
    setExpenses(res.data);
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