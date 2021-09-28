const settings = {
    maxPlayers: 2,
};

class gameState {
    constructor() {
        this.grid = [];
        this.gameOver = false;
        this.winner = null;
        this.players = [];
        this.playerTurn = 0;
    }
}

class chip {
    constructor() {}
}

/*
 *Handles all server events/logic for the game
 * io: is the server 
 * client: client that sent server request
 * gameID: all gameID's in the server
 * gameSession: gameSession object list from server
 */
const initializeIO = function(io, client, gameID, gameSession) {}

const playerAdded = function(clientID, gameState) {
    gameState.players.push(clientID);
}

const playerLeft = function(clientID, gameState) {
    for (let index = 0; index < gameState.players.length; index++) {
        if (gameState.players[index] == clientID) {
            gameState.players.splice(index, 1);
        }
    }
}

function newGameState() {
    return new gameState;
}

module.exports = {
    settings,
    initializeIO,
    playerAdded,
    playerLeft,
    newGameState
}