import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Navbar from './navbar';
import Notification from './notification';
import '../css/calendar.css'

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showRemoveEventModal, setShowRemoveEventModal] = useState(false);
  const [user, setUser] = useState(null);
  const [removeEvent, setRemoveEvent] = useState({});
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: '3', //Default to personal
  });
  console.log(events);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await fetch('/api/get_user', { credentials: 'include' });
        const data = await result.json();
        if (result.ok) { setUser(data.data); }
        else { setUser(null); }
      }
      catch (error) {
        console.error("Failed to fetch user: ", error);
        setUser(null);
      }
    };
    if (!user)
      fetchUser();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      fetch('/api/get_events', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          console.log('data: ', data);
          console.log('data.events: ', data.events);
          setEvents(data.events)
          console.log('events: ', events);
        })
        .catch((error) => console.log('Failed to fetch events:', error));

      console.log("Events:");
    };

    fetchEvents();
  }, []);


  const scheduleNotification = async (text, status, duration, scheduleTime, userId) => {
    const response = await fetch('http://localhost:3001/add-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, status, duration, scheduleTime, userId }),
    });

    const data = await response.json();
    console.log('Notification scheduled:', data);
  };

  const handleAddEvent = () => {
    setShowAddEventModal(true);
  }

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

      const data = await response.json();

      //local save data
      setEvents([
        ...events,
        {
          title: newEvent.title,
          date: fullDateTime,
          type: newEvent.type,
          id: data.eventId
        }
      ]);

      if (user)
        scheduleNotification(newEvent.title, 0, 60000, fullDateTime, user.Uid);

      setShowAddEventModal(false);
      setNewEvent({ title: '', date: '', time: '', type: 'Personal' });
    }
    catch (err) {
      alert(`Failed to create event. Please try again. ${err}`);
    }
  };

  const handleRemoveEventHelper = (arg = {}) => {
    setRemoveEvent(arg.event);

  }

  const handleRemoveEvent = async (arg) => {
    console.log("Remove event: ", arg)
  }

  return (
    <div className="calendar-container">
      <Navbar />

      {user && <Notification userId={user.Uid} />}

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
            eventClick={(arg) => {handleRemoveEventHelper(arg); setShowRemoveEventModal(true);}}
            height="auto"
          />
        </div>
      </main>

      {showAddEventModal && (
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
                <option value="1">School</option>
                <option value="2">Work</option>
                <option value="3">Personal</option>
                <option value="4">Family</option>
              </select>
              <div className="modal-actions">
                <button type="submit">Add</button>
                <button type="button" onClick={() => setShowAddEventModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showRemoveEventModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Remove Event?</h2>
              <button onClick={handleRemoveEvent}>Remove Event</button>
              <button onClick={() => {setShowRemoveEventModal(false); handleRemoveEventHelper([])}}>Cancel</button>
            </div>
          </div>
      )}
    </div>
  );
};

export default Calendar;