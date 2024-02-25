const express = require('express');
const http = require('http');
const cors = require('cors');
const { initializeSocket } = require('./socketController');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

const io = initializeSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
