const express = require('express');
const cron = require('node-cron');
const app = express();
const port = 3001;

// Simple in-memory queue for notifications
const notificationQueue = [];

// Middleware to parse JSON
app.use(express.json());

// Add notification to the queue
app.post('/add-notification', (req, res) => {
  const { text, status, duration, scheduleTime, userId } = req.body;

  // Create notification object with timestamp and schedule time
  const notification = {
    text,
    status,
    duration,
    scheduleTime: new Date(scheduleTime), // Expecting scheduleTime as ISO string
    userId
  };

  // Add to queue
  notificationQueue.push(notification);
  console.log('Notification scheduled:');
  console.log(notification);

  // Respond that notification has been added
  res.status(200).json({ message: 'Notification scheduled', notification });
});

// Endpoint to get scheduled notifications
app.get('/get-next-notification', (req, res) => {
  const { userId } = req.body;
  const now = new Date();
  const nextNotification = notificationQueue.find(
    (notification) => (notification.scheduleTime <= now && notification.userId == userId)
  );

  if (nextNotification) {
    // Remove the notification from the queue once it is sent
    const index = notificationQueue.indexOf(nextNotification);
    notificationQueue.splice(index, 1);

    res.json(nextNotification);
  } else {
    res.json({ message: 'No notifications to send at this moment' });
  }
});

// Schedule notifications with node-cron
cron.schedule('* * * * *', () => {
  // Check if there are any notifications to send every minute
  const now = new Date();
  
  // Find any notifications that are scheduled to be sent before or at the current time
  notificationQueue.forEach((notification) => {
    if (notification.scheduleTime <= now) {
      // Send notification here (e.g., through a websocket or update frontend)
      console.log(`Sending notification: ${notification.text}`);

      // After sending, remove the notification from the queue
      const index = notificationQueue.indexOf(notification);
      notificationQueue.splice(index, 1);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Notification server running on port ${port}`);
});