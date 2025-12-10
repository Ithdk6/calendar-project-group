import React, {useState} from 'react'
import NavBar from '../parts/navbar';
import {useNavigate} from 'react-router-dom';
import '../css/signin.css'

const Signin = () => {
    const [email, setEmail] = useState('');
    const [pword, setPword] = useState('');
    const navigate = useNavigate();

    const [error, setError] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);
    const handleSubimt = async (e) => {
        e.preventDefault();
        
        setError(null);
        setIsLoading(true);


        const commandId = crypto.randomUUID();

        try {
            const response = await fetch('/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commandId: commandId,
                    payload: {
                        email: email,
                        password: pword
                    }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            console.log('Login successful, User ID:', data.userId);

            localStorage.setItem('userId', data.userId);

            navigate('/calendar');
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
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