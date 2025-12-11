const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { db } = require('./src/database/databaseAggregateFunctions.cjs');

const { post: signinPost } = require('./src/pages/api/_find_user.cjs');
const { get: getUser } = require('./src/pages/api/_get_user.cjs');
const { post: createEvent } = require('./src/pages/api/_events.cjs');
const { post: signoutPost } = require('./src/pages/api/_signout.cjs');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4321',
    credentials: true
}));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});