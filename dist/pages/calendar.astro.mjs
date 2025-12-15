import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_CP3F0ez_.mjs';
import 'piccolore';
import 'html-escaper';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { N as Navbar } from '../chunks/navbar_6-lfAdBv.mjs';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const Notification = () => {
  const [notification, setNotification] = useState("");
  const [notificationClass, setNotificationClass] = useState("");
  const [visible, setVisible] = useState(false);
  const clearNotification = () => {
    setVisible(false);
    setNotification("");
    setNotificationClass("");
  };
  const sendNotification = (text, status, duration) => {
    setNotification(text);
    setVisible(true);
    if (status === 0)
      setNotificationClass("successColors");
    else if (status === 1)
      setNotificationClass("neutralColors");
    else if (status === 2)
      setNotificationClass("failColors");
    if (duration !== void 0)
      setTimeout(clearNotification, duration);
  };
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001?userId=user123");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.text) {
        console.log(data);
        sendNotification(data.text, data.status, data.duration);
      }
    };
    return () => {
      ws.close();
    };
  }, []);
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: "globalNotification",
      className: `${visible ? "notification" : "hidden"} ${notificationClass}`,
      onClick: clearNotification,
      children: notification
    }
  );
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "Work"
    //Default to work
  });
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await fetch("http://localhost:3000/pages/api/_get_user", { credentials: "include" });
        const data = await result.json();
        if (result.ok) setUser(data.user);
        else console.error("Error fetching user data: ", data.error);
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };
    fetchUser();
  });
  useEffect(() => {
    fetch("http://localhost:3000/pages/api/_events", { credentials: "include" }).then((res) => res.json()).then((data) => setEvents(data)).catch((error) => console.log("Failed to fetch events:", error));
  }, []);
  const scheduleNotification = async (text, status, duration, scheduleTime, userId2) => {
    const response = await fetch("http://localhost:3001/add-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, status, duration, scheduleTime, userId: userId2 })
    });
    const data = await response.json();
    console.log("Notification scheduled:", data);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const commandId = crypto.randomUUID();
    const fullDateTime = `${newEvent.date}T${newEvent.time}`;
    const payload = {
      commandId,
      payload: {
        title: newEvent.title,
        date: fullDateTime,
        type: newEvent.type,
        time: fullDateTime
      }
    };
    try {
      const response = await fetch("http://localhost:3000/pages/api/_events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to save event");
      }
      setEvents([
        ...events,
        {
          title: newEvent.title,
          date: fullDateTime,
          type: newEvent.type
        }
      ]);
      scheduleNotification(newEvent.title, 0, 6e4, fullDateTime, userId);
      setShowModal(false);
      setNewEvent({ title: "", date: "", time: "", type: "Work" });
    } catch (err) {
      console.error(err);
      alert("Failed to create event. Please try again.");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "calendar-container", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("aside", { className: "type-sidebar", children: [
      /* @__PURE__ */ jsx("h3", { children: "Types" }),
      /* @__PURE__ */ jsxs("ul", { children: [
        /* @__PURE__ */ jsx("li", { children: "All Events" }),
        /* @__PURE__ */ jsx("li", { children: "Work" }),
        /* @__PURE__ */ jsx("li", { children: "Personal" }),
        /* @__PURE__ */ jsx("li", { children: "Family" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Notification, {}),
    /* @__PURE__ */ jsxs("main", { className: "calendar-main", children: [
      /* @__PURE__ */ jsxs("div", { className: "calendar-header", children: [
        /* @__PURE__ */ jsx("h2", { children: "My Calendar" }),
        /* @__PURE__ */ jsx("button", { onClick: handleAddEvent, children: "Add Event" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "calendar-grid", children: /* @__PURE__ */ jsx(
        FullCalendar,
        {
          plugins: [dayGridPlugin],
          initialView: "dayGridMonth",
          events,
          height: "auto"
        }
      ) })
    ] }),
    showModal && /* @__PURE__ */ jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxs("div", { className: "modal", children: [
      /* @__PURE__ */ jsx("h3", { children: "Add New Event" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsx("label", { children: "Title" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: newEvent.title,
            onChange: (e) => setNewEvent({ ...newEvent, title: e.target.value }),
            required: true
          }
        ),
        /* @__PURE__ */ jsx("label", { children: "Date" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: newEvent.date,
            onChange: (e) => setNewEvent({ ...newEvent, date: e.target.value }),
            required: true
          }
        ),
        /* @__PURE__ */ jsx("label", { children: "Time" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "time",
            value: newEvent.time,
            onChange: (e) => setNewEvent({ ...newEvent, time: e.target.value }),
            required: true
          }
        ),
        /* @__PURE__ */ jsx("label", { children: "Type" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: newEvent.type,
            onChange: (e) => setNewEvent({ ...newEvent, type: e.target.value }),
            children: [
              /* @__PURE__ */ jsx("option", { value: "Work", children: "Work" }),
              /* @__PURE__ */ jsx("option", { value: "Personal", children: "Personal" }),
              /* @__PURE__ */ jsx("option", { value: "Family", children: "Family" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "modal-actions", children: [
          /* @__PURE__ */ jsx("button", { type: "submit", children: "Add" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowModal(false), children: "Cancel" })
        ] })
      ] })
    ] }) })
  ] });
};

const $$Calendar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Navbar", Navbar, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspaces/calendar-project-group/src/components/navbar.jsx", "client:component-export": "default" })} ${renderComponent($$result, "CalendarComponent", Calendar, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspaces/calendar-project-group/src/components/calendar.jsx", "client:component-export": "default" })}`;
}, "/workspaces/calendar-project-group/src/pages/calendar.astro", void 0);

const $$file = "/workspaces/calendar-project-group/src/pages/calendar.astro";
const $$url = "/calendar";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Calendar,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
