const settings = {
    maxPlayers: 2,
};

class gameState {
    constructor() {
        this.grid = [];
        this.gameOver = false;
        this.winner = null;
        this.players = [];
    }
}

class chip {
    constructor() {}
}

//Handles all server events for the game
const initializeIO = function(client) {

}

function playerAdded(client, gameState) {

}

function playerLeft(client, gameState) {

}

function newChipPlaced(client, gameState) {

}

function checkWin(client, gameState) {

}

function newGameState() {
    return new gameState;
}

module.exports = {
    settings,
    initializeIO,
    newGameState
}