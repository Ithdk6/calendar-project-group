import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage';
import Signin from './pages/signin';
import Register from "./pages/register";
import About from "./pages/about";
import Contact from "./pages/contact";

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Signin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
        </Routes>
    </Router>
);

export default App;