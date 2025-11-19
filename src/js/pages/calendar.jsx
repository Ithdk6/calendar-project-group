import React, {useState, useEffect} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Navbar from '../parts/navbar';
import '../css/calendar.css'

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date:'',
        time: '',
        group: 'Work', //Default to work
    });

    useEffect(() => {
        fetch('../../api/events')
            .then((res) => res.json())
            .then((data) => setEvents(data))
            .catch((error) => console.log('Failed to fetch events:', error));
    }, []);

    const handleAddEvent = () => {
        setShowModal(true)
    };

    const handleSubmit = () => {
        e.preventDefault();
        const fullDateTime = `${newEvent.date}T${newEvent.time}`;
        setEvents([
            ...events,
            {
                title: `${newEvent.title} (${newEvent.group})`,
                date: fullDateTime,
                group: newEvent.group,
            }
        ]);
        setShowModal(false);
        setNewEvent({title: '', date:'', group: 'Work'});
    };

    return (
        <div className="calendar-container">
            <Navbar />

            <aside className="group-sidebar">
                <h3>Groups</h3>
                <ul>
                    <li>All Events</li>
                    <li>Work</li>
                    <li>Personal</li>
                    <li>Family</li>
                </ul>
                </aside>
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
                            <label>Title</label>
                            <input
                                type="text"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                required
                            />
                            <label>Date</label>
                            <input
                                type="date"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                required
                            />
                            <label>Time</label>
                            <input
                                type="time"
                                value={newEvent.time}
                                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                required
                            />
                            <label>Group</label>
                            <select
                                value={newEvent.group}
                                onChange={(e) => setNewEvent({...newEvent, group: e.target.value})}
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