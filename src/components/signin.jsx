import React, { useState } from 'react'
import NavBar from './navbar';
import '../css/signin.css'

const Signin = () => {
  const [email, setEmail] = useState('');
  const [pword, setPword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubimt = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const command = {
      commandId: crypto.randomUUID(),
      payload: { email, password: pword },
    }

    try {
      const result = await fetch('/api/find_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
        credentials: 'include'
      });

      const data = await result.json();

      if (data.status === 'accepted') {
        console.log("Logged in successfully: ", data)
        globalThis.location.href = '/';
      }
      else if (data.status === 'already processed')
        setError('This command has already been processed')
      else if (data.error)
        setError(data.error);
      else
        setError('Log in failed. Please try again.');
    }
    catch (err) {
      console.log("Failed to send login command: ", err)
      setError("Network error. Please try again.")
    }
    finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    globalThis.location.href = '/register';
  }

  return (
    <div className="signin-container">
      <NavBar />
      <main>
        <form className="signin-form" onSubmit={handleSubimt}>
          <h2>SyncUp</h2>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={pword}
            onChange={(e) => setPword(e.target.value)}
            required
          />

          <button type="submit">Sign In</button>

          <div className="register-link">
            <button type="button" onClick={handleRegister}>Register</button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Signin;