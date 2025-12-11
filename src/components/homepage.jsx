import React from 'react';
import NavBar from './navbar';
import '../css/homepage.css'

const Homepage = () => {
    return (
        <div className="homepage-container">
            <NavBar />
            <main>
                <header className="homepage-header">
                    <h1>Welcome to SyncUp</h1>
                    <p>Plan together. Find time. Stay organized.</p>
                    <button className="getStarted" onClick={() => window.location.href='/register'}>Get Started</button>
                </header>

                <section className="homepage-content">
                    <h2>Introduction</h2>
                    <p>
                        SyncUp helps groups overcome scheduling conflicts and issues by identifying shared availability.
                        Whether you're planning your next project meeting or looking to gather the family for an event, SyncUp has the customizable solution for you!
                    </p>
                </section>

                <section className="homepage-content">
                    <h2>Features</h2>
                    <p><strong>Including:</strong></p>
                    <ul className="services">
                        <li className="service-item">Personal calendar editing & saving</li>
                        <li className="service-item">Sharing/syncing with others</li>
                        <li className="service-item">Grouping for managers or large families</li>
                        <li className="service-item">Share full event details and notes</li>
                        <li className="service-item">Get notifications about RSVPs and event times</li>
                    </ul>
                    <p><strong>Not including</strong></p>
                    <ul className="services">
                        <li className="service-item">We won't share your location or personal data</li>
                        <li className="service-item">Going to your events for you (We know. We dont want to see your mother in law either).</li>
                    </ul>
                </section>
            </main>
        </div>
    );
};

export default Homepage;