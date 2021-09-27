const username_gen = require('username-generator');
//Games
const connectFour = require('./Games/connectFour');

//Map all the gameModules to a string for easy acess
const gameModules = new Map();
gameModules.set('connectFour', connectFour);

const gameSessions = {}; //stores all the client rooms, each [i] is a GameSession object : indexd by the gameID
const gameIDs = new Map() // maps the client id to their gameID

//Maps the url the clinet connects to, to a gameId for access (joins active game)
const URL_ID = new Map();

var io = null;

class GameSession {
    constructor(gameId, url_id, gameType, gameModule) {
        this.gameId = gameId;
        this.url_id = url_id;
        this.gameModule = gameModule;
        this.maxPlayers = gameModule.settings.maxPlayers;
        this.gameState = gameModule.newGameState();
        this.gameType = gameType;
        this.currentPlayers = 0;
        this.players = {};
    }

    // returns true if player can join this gamesession 
    canJoin() {
        if (this.maxPlayers == this.currentPlayers) {
            return false;
        }
        return true;
    }

    addPlayer(clientID) {
        this.players[clientID] = createUserName();
        this.currentPlayers += 1;
        this.gameModule.playerAdded(clientID, this.gameState);
    }

    removePlayer(clientID) {
        if (this.players[clientID] != null) {
            delete this.players[clientID];
            this.currentPlayers -= 1;
            this.gameModule.playerLeft(clientID, this.gameState);
        }
    }

}

const initializeIO = function(server, client) {
    io = server;
    console.log(`${client.id} connected`); // client connects to page

    //Intialize game logic for every game 
    for (const value of gameModules.values()) {
        value.initializeIO(io, client, gameIDs, gameSessions);
    }

    /*****Game Join/Leave******/
    // Client requests to create new game
    client.on('newGame', (gameType) => {
        newGame_Request(client, gameType);
    });

    // Client requests to join a game
    client.on('joinGame', (gameId) => {
        joinRequest(client, gameId);
    })

    //Request complete, client either created a new room or joined one 
    client.on('changedPage', (data) => {
        changedPage(client, data);
    });

    client.on("disconnecting", () => {
        disconnecting(client);
    });
    /****************************/

    client.on("home", () => {
        disconnecting(client);
        client.emit(`redirect`, '/');
    });
}

function joinRequest(client, gameId) { // when pressing the join button, redirect 
    if (gameSessions[gameId] != null) {
        let gameSes = gameSessions[gameId];
        if (gameSes.canJoin()) {
            client.emit(`redirect`, `/game_${gameSes.gameType}=${gameSes.url_id}`);
        } else {
            client.emit('gameFull');
        }
    } else {
        client.emit('failed_join');
    }
}

function changedPage(client, data) {
    if (URL_ID.has(data.url_id)) { // joining a game
        let gameId = URL_ID.get(data.url_id);
        let gameSes = gameSessions[gameId];
        if (gameSes != null && gameSes.canJoin()) { // check if game is full
            client.join(`${gameId}`); // join client into the socket.io room
            gameIDs.set(client.id, gameId); // place them in the mapping
            gameSes.addPlayer(client.id);
            console.log(`user_id : ${client.id} joined ${gameSes.gameId} game`);
            io.to(`${gameId}`).emit('joined', gameSes);
        } else {
            client.emit(`redirect`, '/');
            client.emit('gameFull');
        }
    } else { // new game 
        newGame(client, data.gameType, data.url_id);
    }
}

function disconnecting(client) {
    let gameId = gameIDs.get(client.id);
    if (gameSessions[gameId] != null) {
        let gameSes = gameSessions[gameId];
        gameIDs.delete(client.id);
        gameSes.removePlayer(client.id);
        console.log(`user_id : ${client.id} left ${gameSes.gameId} game`);
        if (gameSes.currentPlayers == 0) {
            delete gameSessions[gameId]; //remove the GameSession object from memory 
        } else {
            io.to(`${gameId}`).emit('leave', gameSes);
        }
    }
}

function newGame_Request(client, gameType) {
    console.log(`user_id : ${client.id} creating new ${gameType} game`);
    let url_id = uniqueId();
    let destination = `/game_${gameType}=${url_id}`;
    client.emit(`redirect`, destination);
}

function newGame(client, gameType, url_id) {
    let gameId = uniqueId().substr(2, 6).toUpperCase(); // 6 digit code
    console.log(`user_id : ${client.id} created ${gameType} game with id : ${gameId}`);
    client.join(`${gameId}`);
    gameIDs.set(client.id, gameId);
    gameSessions[gameId] = new GameSession(gameId, url_id, gameType, gameModules.get(gameType));
    let gameSes = gameSessions[gameId];
    gameSes.addPlayer(client.id);
    io.to(`${gameId}`).emit('joined', gameSes);
    URL_ID.set(url_id, gameId);
}


//creates a unique id 
function uniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createUserName() {
    const userName = username_gen.generateUsername('', 5);
    return userName
}

module.exports = {
    initializeIO
}