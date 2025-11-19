import React from 'react';
import {useNavigate} from "react-router-dom";
import './navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleSignin = () => {
        navigate("/login");
    };

    return (
        <header className="navbar">
            <button className="signin" onClick={handleSignin}>Sign In</button>
            <nav className="nav-links">
                <a href="/">Home</a>
                <a href="/calendar">Calendar</a>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
            </nav>
            <div className="brand">SyncUp</div>
        </header>
    );
};

export default Navbar;