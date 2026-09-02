const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "<http://localhost:5173>", // Vite dev server default port
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'RPG Backend Running' });
});

// Socket.IO events for real-time features
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('playerMove', (data) => {
    // Broadcast player movement to all other players
    socket.broadcast.emit('playerMoved', {
      playerId: socket.id,
      position: data.position
    });
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on <http://localhost>:${PORT}`);
  console.log(`📡 Socket.IO listening for real-time events`);
});