const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;;

//Setup modules
const router = require('./route');
const gameHandler = require('./gameHandler');

//Sets routes
app.use(router);

io.on('connection', (client) => {
    gameHandler.initializeIO(io, client);
});

server.listen(PORT, () => {
    console.log(`listening on PORT: ${PORT}`);
});