import React, { useState, useEffect } from 'react';
import '../css/notification.css';

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

    if (status === 0)
      setNotificationClass('successColors');
    else if (status === 1)
      setNotificationClass('neutralColors');
    else if (status === 2)
      setNotificationClass('failColors');

    if (duration !== undefined)
      setTimeout(clearNotification, duration);
  };

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001?userId=user123');
    
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