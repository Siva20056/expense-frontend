import React, { useState } from 'react';
import axios from 'axios';

// REPLACE WITH YOUR RENDER URL
const API_URL = "https://expense-backend-bcd9.onrender.com"; 

export default function App() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if(!phone || !pin) return alert("Please fill details");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { phone, pin });
      if (res.data.success) {
        setUser(res.data.user);
        fetchExpenses(res.data.user.phone);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert("Login Failed: " + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const fetchExpenses = async (ph) => {
    try {
      const res = await axios.get(`${API_URL}/api/expenses?phone=${ph}`);
      setExpenses(res.data);
    } catch (error) { console.error("Fetch error", error); }
  };

  // --- LOGIN SCREEN ---
  if (!user) return (
    <div style={{ padding: 40, maxWidth: 400, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2> Expense Tracker </h2>
      <p>Login or Register instantly</p>
      
      <label>Phone Number:</label>
      <input 
        type="text" 
        value={phone} 
        onChange={e => setPhone(e.target.value)} 
        placeholder="+91..." 
        style={{ width: '100%', padding: 10, marginTop: 5, marginBottom: 20 }}
      />
      
      <label>Set/Enter PIN:</label>
      <input 
        type="password" 
        value={pin} 
        onChange={e => setPin(e.target.value)} 
        placeholder="4 digit pin" 
        style={{ width: '100%', padding: 10, marginTop: 5, marginBottom: 20 }}
      />

      <button 
        onClick={handleLogin} 
        disabled={loading}
        style={{ 
          width: '100%', padding: 12, background: '#007bff', color: '#fff', 
          border: 'none', borderRadius: 5, cursor: 'pointer' 
        }}>
        {loading ? "Processing..." : "Login / Register"}
      </button>
    </div>
  );

  // --- DASHBOARD SCREEN ---
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Expenses</h2>
        <button onClick={() => setUser(null)} style={{ padding: '5px 10px' }}>Logout</button>
      </div>
      
      <button onClick={() => fetchExpenses(user.phone)} style={{ marginBottom: 20, padding: 10 }}>
        Refresh Data
      </button>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f0f0f0' }}>
          <tr>
            <th>Date</th>
            <th>Merchant</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
             <tr><td colSpan="4" style={{textAlign:'center'}}>No expenses found yet.</td></tr>
          ) : (
            expenses.map((exp) => (
              <tr key={exp._id}>
                <td>{new Date(exp.date).toLocaleDateString()}</td>
                <td>{exp.merchant}</td>
                <td>{exp.category}</td>
                <td style={{ fontWeight: 'bold' }}>₹{exp.amount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}