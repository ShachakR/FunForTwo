const settings = {
    maxPlayers: 2,
};

const MAX_ROW = 6;
const MAX_COL = 7;

class gameState {
    constructor() {
        this.grid = createGrid();
        this.gameOver = false;
        this.winner = null;
        this.players = [];
        this.playerTurn = -1; // 0 for yellow, 1 for red
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

/*
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
        gameSession.gameState.winner = null;

        io.to(`${gameID}`).emit('CF_update', gameSession);
    });
}

const playerAdded = function(clientID, gameState) {
    if (gameState.players.length == 0) {
        gameState.playerTurn = 0;
    }

    gameState.players.push(clientID);
}

const playerLeft = function(clientID, gameState) {
    for (let index = 0; index < gameState.players.length; index++) {
        if (gameState.players[index] == clientID) {
            gameState.players.splice(index, 1);
        }
    }
    if (gameState.players.length == 0) gameState.playerTurn = -1;
}

//gameState is a refrence to an object of this class' gameState object
function placeChip(client, gameState, row, col) {
    const player = gameState.playerTurn;

    //check if its the player's turn to place a chip 
    if (player == -1 || gameState.players[player] != client.id) {
        return;
    }

    var color = "yellow";
    col = parseInt(col);
    row = parseInt(row);

    if (player == 1) color = "red";

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

    gameState.playerTurn = (gameState.playerTurn + 1) % 2;
    if (checkWin(gameState.grid, color, row, col)) {
        gameState.winner = client.id;
        gameState.gameOver = true;
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

function newGameState() {
    return new gameState;
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

module.exports = {
    settings,
    initializeIO,
    playerAdded,
    playerLeft,
    newGameState
}