import React, { useState } from 'react';

export default function App() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [user, setUser] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const register = async () => {
    await fetch('http://localhost:3001/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    alert('Registered!');
  };

  const login = async () => {
    const res = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) setUser(data.user);
    else alert('Invalid login');
  };

  return (
    <div style={{ padding: 20 }}>
      {user ? (
        <h2>Hello, {user.username}</h2>
      ) : (
        <>
          <input name="username" placeholder="Username" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} />
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>
        </>
      )}
    </div>
  );
}
