import React, {useState} from 'react';
import NavBar from './navbar';
import '../css/contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Message submitted:', formData);
    //add form submission logic here
  };

  return (
    <div className="contact-container">
      <NavBar />
      <main>
        <div className="contact-info">
          <h2>Contact Us</h2>
          <p><strong>Address:</strong> 123 main street, Fakeville, USA, 65401</p>
          <p><strong>Phone:</strong> (555) 555-5555</p>
          <p><strong>Email:</strong> contact@syncupapp.com</p>
        </div>

        <div className="contact-main">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3>Send Us a Message</h3>

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

            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            />

            <button type="submit">Submit</button>
          </form>

          <div className="map-embed">
            <h3>Our Location</h3>
            <iframe
              title="SyncUp Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3089.771059438733!2d-91.7749446846407!3d37.95470997972937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87dcbf3e1f3c8f3f%3A0x8c7b0f6e6e4e1e3e!2sMissouri%20University%20of%20Science%20and%20Technology!5e0!3m2!1sen!2sus!4v1700260000000"
              width="100%"
              height="300"
              style={{border: 0}}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </main>
    </div>
  );
};

export default Contact;