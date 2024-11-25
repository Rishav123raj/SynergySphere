const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => res.send('Messaging Server is running...'));

// WebSocket Setup
wss.on('connection', (ws) => {
    console.log('A user connected.');

    ws.on('message', async (messageData) => {
        const data = JSON.parse(messageData);

        if (data.type === 'sendMessage') {
            // Save the message to the database
            const Message = require('./models/Message');
            const newMessage = new Message(data.message);
            await newMessage.save();

            // Broadcast the message to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'newMessage', message: data.message }));
                }
            });
        }
    });

    ws.on('close', () => console.log('A user disconnected.'));
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
