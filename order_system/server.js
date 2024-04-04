// Example using Express.js
const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const cors = require('cors');

const updateService = require('./services/updateService');
const routes = require('./routes/index');
const db = require('./DatabaseAccess/databaseAccess');


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', // Same as above
        methods: ['GET', 'POST']
    }
});

app.use(express.json());

app.use(cors());


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

// Function to be called on shutdown
function onShutdown() {
    console.log('Server is shutting down, performing cleanup...');
    // Perform your cleanup tasks here
    // For example: close database connections, stop background services, etc.
    db.write("DELETE FROM order_items;")
    db.write("DELETE FROM orders;")
    process.exit(0);
}

// Handle shutdown signals
process.on('SIGINT', () => { // Signal for interruption (Ctrl+C)
    console.log('SIGINT signal received.');
    onShutdown();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => { // Signal for termination
    console.log('SIGTERM signal received.');
    onShutdown();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('exit', (code) => { // Normal exit
    console.log(`Process exited with code ${code}`);
    onShutdown();
});

