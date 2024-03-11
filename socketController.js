const { Server } = require('socket.io');
const { createRoom } = require('./room');
const { handlePlay } = require('./gameLogic');

const rooms = {};

function generateRoomId() {
  return Math.random().toString(36).substr(2, 9);
}

function findAvailableRoom() {
  for (const roomId in rooms) {
    if (rooms[roomId]['players'].length < 2) {
      return roomId;
    }
  }
  return generateRoomId();
}

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://192.168.1.183:3000'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinGame', () => {
      const availableRoomId = findAvailableRoom();
      socket.join(availableRoomId);

      if (!rooms[availableRoomId]) {
        rooms[availableRoomId] = createRoom(availableRoomId);
      }
      rooms[availableRoomId]['players'].push(socket.id);

      const roomSize = rooms[availableRoomId]['players'].length;
      if (roomSize === 2) {
        io.to(availableRoomId).emit('gameStarted', {
          roomId: availableRoomId,
          players: rooms[availableRoomId]['players'],
          turn: rooms[availableRoomId]['players'][0],
          startingPlayer: rooms[availableRoomId]['currentFootballer'].playerName
        });
      }
    });

    socket.on('cancelGame', () => {

      for (const roomId in rooms) {
        const index = rooms[roomId]['players'].indexOf(socket.id);
        if (index !== -1) {
          rooms[roomId]['players'].splice(index, 1);
          if (rooms[roomId]['players'].length === 0) {
            delete rooms[roomId];
          }
          break;
        }
      }
    });

    // Handling messages when the game has started
    socket.on('sendMessage', (message) => {
      console.log('Message received:', message);
      const room = rooms[message.roomId];
      handlePlay(io, socket.id, message.content, room);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');

      for (const roomId in rooms) {
        const index = rooms[roomId]['players'].indexOf(socket.id);
        if (index !== -1) {
          rooms[roomId]['players'].splice(index, 1);
          if (rooms[roomId]['players'].length === 0) {
            delete rooms[roomId];
          }
          break;
        }
      }
    });
  });

  return io;
}

module.exports = {
  initializeSocket,
};
