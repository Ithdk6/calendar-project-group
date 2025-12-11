import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Navbar from './navbar';
import Notification from './notification';
import '../css/calendar.css'

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Work', //Default to work
  });

  //userId now temporarily stored locally
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await fetch('/api/get_user', { credentials: 'include' });
        const data = await result.json();
        if (result.ok) setUser(data.user);
        else console.error('Error fetching user data: ', data.error);
      }
      catch (error) {
        console.error('Error fetching user data: ', error);
      }
    }

    fetchUser();
  })

  useEffect(() => {
    fetch('/api/events', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((error) => console.log('Failed to fetch events:', error));
  }, []);

  const scheduleNotification = async (text, status, duration, scheduleTime, userId) => {
    const response = await fetch('/api/queue_notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, status, duration, scheduleTime, userId }),
    });

    const data = await response.json();
    console.log('Notification scheduled:', data);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const commandId = crypto.randomUUID();
    const fullDateTime = `${newEvent.date}T${newEvent.time}`;


    const payload = {
      commandId: commandId,
      payload: {
        title: newEvent.title,
        date: fullDateTime,
        type: newEvent.type,
        time: fullDateTime
      }
    };


    try {

      //save event to database
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      //local save data
      setEvents([
        ...events,
        {
          title: newEvent.title,
          date: fullDateTime,
          type: newEvent.type,
        }
      ]);

      // TODO: associate notification with authenticated users
      //use local userId after event added
      scheduleNotification(newEvent.title, 0, 60000, fullDateTime, userId);

      setShowModal(false);
      setNewEvent({ title: '', date: '', time: '', type: 'Work' });
    }
    catch (err) {
      console.error(err);
      alert("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="calendar-container">
      <Navbar />

      <aside className="type-sidebar">
        <h3>Types</h3>
        <ul>
          <li>All Events</li>
          <li>Work</li>
          <li>Personal</li>
          <li>Family</li>
        </ul>
      </aside>

      <Notification />

      <main className="calendar-main">
        <div className="calendar-header">
          <h2>My Calendar</h2>
          <button onClick={handleAddEvent}>Add Event</button>
        </div>

        <div className="calendar-grid">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
          />
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Event</h3>
            <form onSubmit={handleSubmit}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                required
              />
              <label htmlFor="time">Time</label>
              <input
                id="time"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                required
              />
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Family">Family</option>
              </select>
              <div className="modal-actions">
                <button type="submit">Add</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;