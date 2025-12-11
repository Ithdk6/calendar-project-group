import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import cron from 'node-cron';
import http from 'http';

const app = express();
const port = 3001;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Map();
const notificationQueue = []; // You had this referenced but not defined

app.use(express.json());

wss.on('connection', (ws, req) => {
  const userId = req.url.split('?')[1]?.split('=')[1]; 
  ws.userId = userId;

  console.log(`Connection from '${userId}'`);
  clients.set(userId, ws);

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    clients.delete(userId);
  });
});

// Add a new notification to the queue
app.post('/add-notification', (req, res) => {
  const { text, status, duration, scheduleTime, userId } = req.body;

  const notification = {
    text,
    status,
    duration,
    scheduleTime: new Date(scheduleTime),
    userId,
  };

  notificationQueue.push(notification);
  console.log('Notification scheduled:');
  console.log(notification);

  res.status(200).json({ message: 'Notification scheduled', notification });
});

function sendNotificationToClient(userId, notification) {
  const client = clients.get(userId);

  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(notification));
    console.log(`Sending to '${userId}':`, notification);
  } else {
    console.log(`User '${userId}' not connected`);
  }
}

cron.schedule('* * * * *', () => {
  const now = new Date();

  notificationQueue.forEach((notification) => {
    if (notification.scheduleTime <= now) {
      sendNotificationToClient(notification.userId, notification);

      const index = notificationQueue.indexOf(notification);
      notificationQueue.splice(index, 1);
    }
  });
});

server.listen(port, () => {
  console.log(`Notification server running on http://localhost:${port}`);
});