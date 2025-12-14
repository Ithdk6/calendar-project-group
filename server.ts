import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import cron from 'node-cron';
import http from 'node:http';

interface Notification {
  text: string,
  status: string,
  duration: number,
  scheduleTime: Date,
  userId: string,
}

interface Client extends WebSocket {
  userId: string,
}

const app = express();
const port = 3001;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Map<string, Client>();
let notificationQueue: Notification[] = [];

app.use(express.json());

wss.on('connection', (client: Client, req: http.IncomingMessage) => {
  let userId: string | undefined;
  try {
    const full = `http://localhost${req.url ?? ''}`;
    userId = new URL(full).searchParams.get('userId') ?? undefined;
    if (!userId || userId === 'undefined') throw new Error('userId not provided');
  } catch (err) {
    console.error('Error parsing userId from URL:', err);
    client.close();
    return;
  }

  userId = String(userId);
  client.userId = userId;

  console.log(`Connection from '${userId}'`);
  clients.set(userId, client);

  client.on('message', (message: WebSocket.RawData) => {
    console.log('Received message:', message);
  });

  client.on('close', () => {
    console.log(`'${userId}' disconnected.`);
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
    userId: String(userId),
  };

  notificationQueue.push(notification);
  console.log('Notification scheduled:');
  console.log(notification);

  res.status(200).json({ message: 'Notification scheduled', notification });
});

function sendNotificationToClient(userId: string, notification: string) {
  const lookupKey = String(userId);
  const client = clients.get(lookupKey);

  if (client?.readyState === WebSocket.OPEN) {
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
      sendNotificationToClient(notification.userId, JSON.stringify(notification));

      const index = notificationQueue.indexOf(notification);
      notificationQueue.splice(index, 1);
    }
  });
});

server.listen(port, () => {
  console.log(`Notification server running on http://localhost:${port}`);
});