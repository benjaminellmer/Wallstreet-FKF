// Example using Express.js
const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const cors = require('cors');

const updateService = require('./services/updateService');
const routes = require('./routes/index');


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://127.0.0.1:8080', // Same as above
        methods: ['GET', 'POST']
    }
});

app.use(express.json());

app.use(cors({
    origin: 'http://127.0.0.1:8080'  // Your Svelte front-end URL
}));


// Use routes
app.use('/api/', routes);

app.use(express.static(path.join(__dirname, '/public')));

// Serve your Svelte app's 'index.html' file at all other paths
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', 'index.html'));
});



// Listen for new connections from clients (web browsers, etc.)
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

updateService.startScheduledTasks(io);

// Example specifying the port and starting the server
const port = process.env.PORT || 3000; // You can use environment variables for port configuration
server.listen(port, () => {
    console.log(`Server listening at http://127.0.0.1:${port}`);
});

