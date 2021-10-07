class GameState {
    constructor(maxPlayers) {
        this.gameOver = false;
        this.tie = false;
        this.winner = null;
        this.players = this.createList(maxPlayers);
        this.playerTurn = -1; // 0 for yellow, 1 for red
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

module.exports = {
    GameState
}