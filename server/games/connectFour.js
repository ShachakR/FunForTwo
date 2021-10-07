const gameUtility = require('../gameUtility');

/***** REQUIRED Variables *****/
const gameType = "connectFour";
const maxPlayers = 2;
/*******************/

const MAX_ROW = 6;
const MAX_COL = 7;

class State extends gameUtility.GameState {
    constructor(maxPlayers) {
        super(maxPlayers);
        this.grid = createGrid();
        this.chipCount = 0;
    }
}

class chip {
    constructor(color, row, col, orgRow) {
        this.color = color;
        this.row = row;
        this.col = col;
        this.orgRow = orgRow;
    }
}

/* REQUIRED Function */
function newGameState() {
    return new State(maxPlayers);
}


/* REQUIRED Function 
 *Handles all server events/logic for the game
 * io: is the server 
 * client: client that sent server request
 * gameID: all gameID's in the server
 * gameSession: gameSession object list from server
 */
const initializeIO = function(io, client, gameIDs, gameSessions) {

    client.on('CF_click', (data) => {
        const gameID = gameIDs.get(client.id);
        const gameSession = gameSessions[gameID];

        if (gameSession.gameState.gameOver == true || gameSession.currentPlayers < gameSession.maxPlayers) {
            return;
        }

        placeChip(client, gameSession.gameState, data.row, data.col);
        io.to(`${gameID}`).emit('CF_update', gameSession);
    });

    client.on('CF_restart', () => {
        const gameID = gameIDs.get(client.id);
        const gameSession = gameSessions[gameID];

        if (gameSession.gameState.gameOver == false) {
            return;
        }

        gameSession.gameState.grid = createGrid();
        gameSession.gameState.playerTurn = 0;
        gameSession.gameState.gameOver = false;
        gameSession.gameState.tie = false;
        gameSession.gameState.chipCount = 0;
        gameSession.gameState.winner = null;

        io.to(`${gameID}`).emit('CF_update', gameSession);
    });
}

//gameState is a refrence to an object of this class' gameState object
function placeChip(client, gameState, row, col) {
    const playerTurn = gameState.playerTurn;

    //check if its the player's turn to place a chip 
    if (playerTurn == -1 || gameState.players[playerTurn] != client.id) {
        return;
    }

    var color = "yellow";
    col = parseInt(col);
    row = parseInt(row);

    if (playerTurn == 1) color = "red";

    //find where to place the chip on the col
    const orgRow = row;
    row = MAX_ROW - 1; // start at the bottom
    for (let i = 0; i < MAX_ROW; i++) {
        for (let j = 0; j < MAX_COL; j++) {
            const chip = gameState.grid[i][j];
            if (chip != null && chip.col == col) {
                row = Math.min(row, chip.row - 1);
            }
        }
    }

    if (row < 0) return;

    //add new chip to the grid, end player's turn
    const newChip = new chip(color, row, col, orgRow);
    gameState.grid[row][col] = newChip;
    gameState.chipCount += 1;

    //set next turn
    gameState.nextTurn();

    if (checkWin(gameState.grid, color, row, col)) {
        gameState.winner = client.id;
        gameState.gameOver = true;
    } else {
        if (gameState.chipCount == 42) {
            gameState.tie = true;
            gameState.gameOver = true;
        }
    }
}

function checkWin(grid, color, row, col) {
    let left = check(grid, color, row, col, 0, 0, -1);
    let right = check(grid, color, row, col, 0, 0, 1);
    let up = check(grid, color, row, col, 0, -1, 0);
    let down = check(grid, color, row, col, 0, 1, 0);
    let leftUp = check(grid, color, row, col, 0, -1, -1);
    let rightUp = check(grid, color, row, col, 0, -1, 1);
    let leftDown = check(grid, color, row, col, 0, 1, -1);
    let rightDown = check(grid, color, row, col, 0, 1, 1);

    return (left || right || up || down || leftUp || leftDown || rightUp || rightDown);
}

function check(grid, color, row, col, count, rowDirection, colDirection) {
    if (count >= 4) return true;

    if (row >= 0 && row < MAX_ROW && col >= 0 && col < MAX_COL && grid[row][col] != null) {
        if (grid[row][col].color == color) {
            count += 1;
            let newRow = row + rowDirection;
            let newCol = col + colDirection;
            const res = check(grid, color, newRow, newCol, count, rowDirection, colDirection);
            if (res == true) {
                grid[row][col].color = "chartreuse";
            }
            return res;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

//creates a 2d array and returns it for the gamestate object
function createGrid() {
    const array = [];

    for (let i = 0; i < MAX_ROW; i++) {
        array[i] = [];
        for (let j = 0; j < MAX_COL; j++) {
            array[i][j] = null;
        }
    }
    return array;
}

/** REQUIRED */
module.exports = {
    initializeIO,
    newGameState,
    gameType
}