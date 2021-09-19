const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;;

//Games
const connectFour = require('../server/Games/connectFour')

//Map all the gameModules to a string for easy acess
const gameModules = new Map();
gameModules.set('connectFour', connectFour);

//stores all the client rooms, each [i] is a GameSession object
const clientRooms = [];

//Maps the url the user connects to a gameId for access (joins active game)
const urlToId = new Map();

class GameSession {
  constructor(gameId, maxPlayers, gameType, url_id) {
    this.gameId = gameId;
    this.maxPlayers = maxPlayers;
    this.url_id = url_id;
    this.gameType = gameType;
    this.currentPlayers = 1;
  }

  // returns true if player can join this gamesession 
  join() {
    if (this.maxPlayers == this.currentPlayers.length) {
      return false;
    }
    this.currentPlayers += 1;
    return true;
  }

}

//static folder 
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/games/connectFour')));

app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } catch (err) {
    res.status(404);
    res.send('Error 404: failed to load page');
  }
});

app.get(`/game_connectFour=\*`, (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../frontend/games/connectFour/main.html'));
  } catch (err) {
    res.status(404);
    res.send('Error 404: failed to load page');
  }
});

io.on('connection', (client) => {
  console.log(`${client.id} connected`); // client connects to page

  /*****CREATING GAME******/
  // Client requests to create new game
  client.on('newGame', (gameType) => {
    console.log(`user_id : ${client.id} creating new ${gameType} game`);
    let url_id = uniqueId();
    let destination = `/game_${gameType}=${url_id}`;
    client.emit(`redirect`, destination);
  });

  //Request complete, client either created a new room or joined one 
  client.on('changedPage', function (data) {
    if(urlToId.has(data.location)){ // joining a game
      let gameId = urlToId.get(data.location);
      client.join(`${gameId}`);
      io.to(`${gameId}`).emit('joined', clientRooms[gameId]);
    }
    else{ // new game 
      newRoom(client, data.gameType, data.location);
    }
  });
  /****************************/

  /*****JOINING GAME******/
  // Client requests to join a game

  client.on('joinGame', (gameId) => {
    join(client, gameId);
  })

  /****************************/

});

server.listen(PORT, () => {
  console.log('listening on *:3000');
});

function newRoom(client, gameType, url_id) {
  let gameId = uniqueId().substr(2, 6).toUpperCase(); // 6 digit code
  console.log(`user_id : ${client.id} created ${gameType} game with id : ${gameId}`);
  client.join(`${gameId}`);
  clientRooms[gameId] = new GameSession(gameId, gameModules.get(gameType).settings.maxPlayers, gameType, url_id);
  io.to(`${gameId}`).emit('joined', clientRooms[gameId]);
  urlToId.set(url_id, gameId);
}

function join(client, gameId) {
  if (clientRooms[gameId] != null) {
    let gameSes = clientRooms[gameId];
    let joined = gameSes.join();
    if (joined) {
      client.join(gameSes.gameId);
      console.log(`user_id : ${client.id} joined ${gameSes.gameId} game`);
      client.emit(`redirect`, `/game_${gameSes.gameType}=${gameSes.url_id}`);
    }
  }
}

function uniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}