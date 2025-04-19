const express = require('express');
const http = require('http');
const path = require('path');
require('dotenv').config();

const { initSocket } = require('./socket');
const { initSerial } = require('./serial');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Serve fichiers React
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Init socket & série
initSocket(server);
initSerial();

server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
