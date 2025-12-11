import React, {useState} from 'react';
import NavBar from './navbar';
import '../css/register.css'

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const [isloading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            setError("Passwords don't match");
            return;
        }

        setIsLoading(true);
        setError('');

        const command = {
            commandId: crypto.randomUUID(),
            payload: {
                name: formData.name,
                email: formData.email,
                password: formData.password
            }
        };

        try{
            const result = await fetch('http://localhost:3000/pages/api/_add_user', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(command),
                credentials: 'include'
            })

            const data = await result.json();

            if (result.status === "Username taken") {
                setError("Email already in use");
            }
            else {
                console.log("API response: ", data)
                window.location.href = '/login'
            }
        }
        catch(err) {
            console.log("Failed to send registration command: ", err)
            setError("Registration failed")
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <NavBar />
            <main>
                <form className="register-form" onSubmit={handleSubmit}>
                    <h2>Create your SyncUp Account</h2>

                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="password_confirmation">Confirm Password</label>
                    <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">Register</button>
                </form>
            </main>
        </div>
    );
};

export default RegisterPage;