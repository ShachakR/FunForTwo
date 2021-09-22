const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;;

//Games
const connectFour = require('../server/Games/connectFour');

//Map all the gameModules to a string for easy acess
const gameModules = new Map();
gameModules.set('connectFour', connectFour);

const gameSessions = []; //stores all the client rooms, each [i] is a GameSession object : indexd by the gameID
const gameIDs = new Map() // maps the client id to what room they are in

//Maps the url the clinet connects to, to a gameId for access (joins active game)
const URL_ID = new Map();

class GameSession {
    constructor(gameId, url_id, gameType, gameModule) {
        this.gameId = gameId;
        this.url_id = url_id;
        this.maxPlayers = gameModule.settings.maxPlayers;
        this.gameState = gameModule.newGameState();
        this.gameType = gameType;
        this.currentPlayers = 0;
    }

    // returns true if player can join this gamesession 
    canJoin() {
        if (this.maxPlayers == this.currentPlayers) {
            return false;
        }
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

    //Intialize game logic for every game 
    for (const value of gameModules.values()) {
        value.initializeIO(io, client, gameSessions, gameIDs);
    }

    /*****GAME JOIN/LEAVE REUQESTS******/
    // Client requests to create new game
    client.on('newGame', (gameType) => {
        newGame(client, gameType);
    });

    // Client requests to join a game
    client.on('joinGame', (gameId) => {
        joinRequest(client, gameId);
    })

    //Request complete, client either created a new room or joined one 
    client.on('changedPage', function(data) {
        changedPage(client, data);
    });

    client.on("disconnecting", () => {
        disconnecting(client);
    });
    /****************************/
});

server.listen(PORT, () => {
    console.log(`listening on PORT: ${PORT}`);
});

function joinRequest(client, gameId) { // when pressing the join button, redirect 
    if (gameSessions[gameId] != null) {
        let gameSes = gameSessions[gameId];
        if (gameSes.canJoin()) {
            client.emit(`redirect`, `/game_${gameSes.gameType}=${gameSes.url_id}`);
        } else {
            client.emit('gameFull');
        }
    }
}

function changedPage(client, data) {
    if (URL_ID.has(data.location)) { // joining a game
        let gameId = URL_ID.get(data.location);
        let gameSes = gameSessions[gameId];
        if (gameSes.canJoin()) { // check if game is full
            client.join(`${gameId}`); // join client into the socket.io room
            gameIDs.set(client.id, gameId); // place them in the mapping
            gameSes.currentPlayers = gameSes.currentPlayers + 1;
            console.log(`user_id : ${client.id} joined ${gameSes.gameId} game`);
            io.to(`${gameId}`).emit('joined', gameSes);
        } else {
            client.emit(`redirect`, '/');
            client.emit('gameFull');
        }
    } else { // new game 
        newRoom(client, data.gameType, data.location);
    }
}

function disconnecting(client) {
    let gameId = gameIDs.get(client.id);
    if (gameSessions[gameId] != null) {
        let gameSes = gameSessions[gameId];
        gameSes.currentPlayers = gameSes.currentPlayers - 1;
        console.log(`user_id : ${client.id} left ${gameSes.gameId} game`);
        io.to(`${gameId}`).emit('leave', gameSes);
    }
}

function newGame(client, gameType) {
    console.log(`user_id : ${client.id} creating new ${gameType} game`);
    let url_id = uniqueId();
    let destination = `/game_${gameType}=${url_id}`;
    client.emit(`redirect`, destination);
}

function newRoom(client, gameType, url_id) {
    let gameId = uniqueId().substr(2, 6).toUpperCase(); // 6 digit code
    console.log(`user_id : ${client.id} created ${gameType} game with id : ${gameId}`);
    client.join(`${gameId}`);
    gameIDs.set(client.id, gameId);
    gameSessions[gameId] = new GameSession(gameId, url_id, gameType, gameModules.get(gameType));
    let gameSes = gameSessions[gameId];
    gameSes.currentPlayers = Math.min(gameSes.maxPlayers, gameSes.currentPlayers + 1);
    io.to(`${gameId}`).emit('joined', gameSes);
    URL_ID.set(url_id, gameId);
}


//creates a unique id 
function uniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}