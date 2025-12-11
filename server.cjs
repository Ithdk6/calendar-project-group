const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const WebSocket = require('ws');
const cron = require('node-cron');
const http = require('node:http');

const { db } = require('./src/database/databaseAggregateFunctions.cjs');

const { post: signinPost } = require('./src/pages/api/_find_user.cjs');
const { get: getUser } = require('./src/pages/api/_get_user.cjs');
const { post: createEvent } = require('./src/pages/api/_events.cjs');
const { post: signoutPost } = require('./src/pages/api/_signout.cjs');

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Map();
let notificationQueue = [];

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4321',
    credentials: true
}));

wss.on('connection', (ws, req) => {
  const userId = req.url?.split('?')[1]?.split('=')[1]; 
  ws.userId = userId;

  console.log(`Connection from '${userId}'`);
  clients.set(userId, ws);

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    clients.delete(userId);
  });

  if (!ws.userId)
    ws.close();
});

async function sendResponse(apiResponse, res) {
    const body = await apiResponse.text();
    res.status(apiResponse.status).send(body);
}

app.post('/pages/api/_find_user', async (req, res) => {
    try {
        const response = await signinPost({ request: req });
        await sendResponse(response, res);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

app.get('/pages/api/_get_user', async (req, res) => {
    try {
        const response = await getUser({ request: req });
        await sendResponse(response, res);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

app.post('/pages/api/_events', async (req, res) => {
    try {
        const response = await createEvent({ request: req });
        await sendResponse(response, res);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

app.post('/pages/api/_signout', async (req, res) => {
    try {
        const response = await signoutPost({ request: req });
        await sendResponse(response, res);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

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
      sendNotificationToClient(notification.userId, JSON.stringify(notification));

      const index = notificationQueue.indexOf(notification);
      notificationQueue.splice(index, 1);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});