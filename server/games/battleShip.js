const gameUtility = require('../gameUtility');

/***** REQUIRED Variables *****/
const gameType = "battleShip";
const maxPlayers = 2;
/*******************/

class State extends gameUtility.GameState {
    constructor(maxPlayers) {
        super(maxPlayers);
    }
}

const initializeIO = function(io, client, gameIDs, gameSessions) {}

/* REQUIRED Function */
function newGameState() {
    return new State(maxPlayers);
}

/** REQUIRED */
module.exports = {
    initializeIO,
    newGameState,
    gameType
}