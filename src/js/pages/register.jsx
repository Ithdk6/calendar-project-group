import React, {useState} from 'react';
import NavBar from '../parts/navbar';
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

    const handleSubmit = (e) => {
        e.preventDefault();
        //add database functionality here
        console.log('Registering: ', formData);
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