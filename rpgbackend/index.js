const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO listening for real-time events`);
});

// Example route: Get all players
app.get('/players', async (req, res) => {
  try {
    const players = await prisma.player.findMany();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example route: Create player
app.post('/players', async (req, res) => {
  try {
    const { name, class: playerClass } = req.body;
    const player = await prisma.player.create({
      data: {
        name,
        class: playerClass,
        hp: 100,
        attack: 10,
        defense: 5,
        mana: 50
      }
    });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});