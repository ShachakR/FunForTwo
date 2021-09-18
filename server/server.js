const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = 3000;

//static folder 
//static folder 
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } catch (err) {
    res.status(404);
    res.send('Error 404: failed to load page');
  }
});

io.on('connection', (socket) => {
  console.log(socket.id);
});

server.listen(PORT, () => {
  console.log('listening on *:3000');
});