import React, {useState} from 'react'
import NavBar from '../parts/navbar';
import {useNavigate} from 'react-router-dom';
import '../css/signin.css'

const Signin = () => {
    const [email, setEmail] = useState('');
    const [pword, setPword] = useState('');
    const navigate = useNavigate();

    const handleSubimt = (e) => {
        e.preventDefault();
        //add sign in logic later
        console.log('Signing in with:', {email, pword});
    };

    const handleRegister = () => {
        navigate('/register');
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