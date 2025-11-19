import React, { useState, useEffect } from 'react';
import './notification.css';

const Notification = () => {
  const [notification, setNotification] = useState('');
  const [notificationClass, setNotificationClass] = useState('');
  const [visible, setVisible] = useState(false);

  const clearNotification = () => {
    setVisible(false);
    setNotification('');
    setNotificationClass('');
  };

  const sendNotification = (text, status, duration) => {
    setNotification(text);
    setVisible(true);

    if (status === 0) setNotificationClass('successColors');
    else if (status === 1) setNotificationClass('neutralColors');
    else if (status === 2) setNotificationClass('failColors');

    if (duration !== undefined) {
      setTimeout(clearNotification, duration);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('http://localhost:3001/get-next-notification');
      const data = await response.json();

      if (data.text) {
        sendNotification(data.text, data.status, data.duration);
      }
    }, 5000); // Poll every 5 seconds for new notifications

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="globalNotification"
      className={`${visible ? 'notification' : 'hidden'} ${notificationClass}`}
      onClick={clearNotification}
    >
      {notification}
    </div>
  );
};

export default Notification;