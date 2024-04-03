// Example using Express.js
const updateService = require('./services/updateService');

const express = require('express');
const http = require('http');

const socketIo = require('socket.io');
const cron = require('node-cron');

const app = express();


const cors = require('cors');

app.use(cors({
    origin: 'http://127.0.0.1:8080'  // Your Svelte front-end URL
}));


app.use(express.json());


// Example defining a route in Express
app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
});


const routes = require('./routes/index');

// Use routes
app.use('/api/', routes);

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://127.0.0.1:8080', // Same as above
        methods: ['GET', 'POST']
    }
});


// Listen for new connections from clients (web browsers, etc.)
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

// Example specifying the port and starting the server
const port = process.env.PORT || 3000; // You can use environment variables for port configuration
server.listen(port, () => {
    console.log(`Server listening at http://127.0.0.1:${port}`);
    updateService.startScheduledTasks(io);
});

