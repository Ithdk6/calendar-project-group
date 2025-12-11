import React, {useState, useEffect} from 'react';
import '../css/navbar.css';

const Navbar = () => {
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await fetch('http://localhost:3000/pages/api/_get_user', {credentials: 'include'});
        const data = await result.json();
        if (result.ok)
          setUser(data.user);
        else
          setUser(null);
      }
      catch (error) {
        console.error("Failed to fetch user: ", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleSignin = () => {
    globalThis.location.href = '/signin';
  };

  const handleSignout = async () => {
    try {
      const response = await fetch('http://localhost:3000/pages/api/_signout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setUser(null);
        globalThis.location.href = '/';
      }
    }
    catch (error) {
      console.error("Sign out failed: ", error);
    }
  };

  return (
    <header className="navbar">
      <div className="brand">SyncUp</div>

      <nav className="nav-links">
        <a href="/">Home</a>
        {user && <a href="/calendar">Calendar</a>}
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>

      <div className="auth-section">
        {user ? (
          <>
            <span className = "user-name">Hello, {user.name}</span>
            <button className="signout" onClick={handleSignout}>
              Sign out
            </button>
          </>
        ) : (
          <button className="signin" onClick={handleSignin}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;