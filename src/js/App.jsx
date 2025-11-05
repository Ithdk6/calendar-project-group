import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './homepage';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/create-account" element={<div>Account creation coming soon!</div>} />
        </Routes>
    </Router>
);

export default App;