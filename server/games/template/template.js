const gameUtility = require('../gameUtility');

/***** REQUIRED Variables *****/
const gameType = "template";
const maxPlayers = 2;
/*******************/

/* REQUIRED Class */
class State extends gameUtility.GameState {
    constructor(maxPlayers) {
        super(maxPlayers);
    }
}

/* REQUIRED Function */
const initializeIO = function(io, client, gameIDs, gameSessions) {
    // Game Logic 
}

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