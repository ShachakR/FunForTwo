const username_gen = require('username-generator');

class GameState {
    constructor(maxPlayers) {
        this.gameOver = false;
        this.tie = false;
        this.winner = null;
        this.players = this.createList(maxPlayers); // stores clientID's
        this.playerTurn = -1;
        this.maxPlayers = maxPlayers;
    }

    playerAdded(clientID) {
        if (this.playerTurn == -1) {
            this.playerTurn = 0;
        }

        for (let index = 0, end = false; index < this.players.length && !end; index++) {
            if (this.players[index] == "undf") {
                this.players[index] = clientID;
                end = true;
            }
        }
    }

    playerLeft(clientID) {
        for (let index = 0, end = false; index < this.players.length && !end; index++) {
            if (this.players[index] == clientID) {
                this.players[index] = "undf";
                end = true;
            }
        }

        if (this.players.length == 0) this.playerTurn = -1;
    }

    nextTurn() {
        for (let index = this.playerTurn + 1; index < this.players.length; index++) {
            if (this.players[index] != "undf") {
                this.playerTurn = index;
                return;
            }
        }
        this.playerTurn = 0;
    }


    createList(size) {
        const array = [];
        for (let i = 0; i < size; i++) {
            array[i] = "undf";
        }
        return array;
    }
}

class GameSession {
    constructor(gameId, url_id, gameType, gameModule) {
        this.gameId = gameId;
        this.url_id = url_id;
        this.gameState = gameModule.newGameState();
        this.gameType = gameType;
        this.maxPlayers = this.gameState.maxPlayers;
        this.currentPlayers = 0;
        this.players = {}; // stores usernames 
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
        this.gameState.playerAdded(clientID);
    }

    removePlayer(clientID) {
        if (this.players[clientID] != null) {
            delete this.players[clientID];
            this.currentPlayers -= 1;
            this.gameState.playerLeft(clientID);
        }
    }

}

function createUserName() {
    const userName = username_gen.generateUsername('', 5);
    return userName
}

module.exports = {
    GameState,
    GameSession
}