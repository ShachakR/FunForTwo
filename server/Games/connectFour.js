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
    constructor(color, row, col) {
        this.color = color;
        this.row = row;
        this.col = col;
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

        if (gameSession.gameState.gameOver == true) {
            return;
        }

        placeChip(client, gameSession.gameState, data.row, data.col);
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

    if (player == 1) color = "red";

    //find where to place the chip on the col
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
    const newChip = new chip(color, row, col);
    gameState.grid[row][col] = newChip;

    gameState.playerTurn = (gameState.playerTurn + 1) % 2;
    if (checkWin(gameState.grid, color, row, col)) {
        gameState.winner = client.id;
        gameState.gameOver = true;
    }
}

function checkWin(grid, color, row, col) {
    return (checkLeft(grid, color, row, col, 0) || checkRight(grid, color, row, col, 0) || checkDown(grid, color, row, col, 0) || checkUp(grid, color, row, col, 0) || checkDiagonal_LeftDown(grid, color, row, col, 0) ||
        checkDiagonal_LeftUp(grid, color, row, col, 0) || checkDiagonal_RightDown(grid, color, row, col, 0) || checkDiagonal_RightUp(grid, color, row, col, 0));
}

function checkLeft(grid, color, row, col, count) {
    if (count >= 4) return true;

    if (row < MAX_ROW && col < MAX_COL && grid[row][col] != null) {
        if (grid[row][col].color == color) {
            count++;
            return checkLeft(grid, color, row, col - 1, count);
        } else {
            return false;
        }
    }
}

function checkRight(grid, color, row, col, count) {
    if (count >= 4) return true;

    if (row < MAX_ROW && col < MAX_COL && grid[row][col] != null) {
        if (grid[row][col].color == color) {
            count++;
            return checkRight(grid, color, row, col + 1, count);
        } else {
            return false;
        }
    }
}

function checkUp(grid, color, row, col, count) {
    if (count >= 4) return true;

    if (row < MAX_ROW && col < MAX_COL && grid[row][col] != null) {
        if (grid[row][col].color == color) {
            count++;
            return checkUp(grid, color, row - 1, col, count);
        } else {
            return false;
        }
    }
}

function checkDown(grid, color, row, col, count) {
    if (count >= 4) return true;

    if (row < MAX_ROW && col < MAX_COL && grid[row][col] != null) {
        if (grid[row][col].color == color) {
            count++;
            return checkDown(grid, color, row + 1, col, count);
        } else {
            return false;
        }
    }
}

function checkDiagonal_LeftUp(grid, color, row, col, count) {
    if (count >= 4) return true;

    if (row < MAX_ROW && col < MAX_COL && grid[row][col] != null) {
        if (grid[row][col].color == color) {
            count++;
            return checkDiagonal_LeftUp(grid, color, row - 1, col - 1, count);
        } else {
            return false;
        }
    }
}

function checkDiagonal_RightUp(grid, color, row, col, count) {
    if (count >= 4) return true;

    if (row < MAX_ROW && col < MAX_COL && grid[row][col] != null) {
        if (grid[row][col].color == color) {
            count++;
            return checkDiagonal_RightUp(grid, color, row - 1, col + 1, count);
        } else {
            return false;
        }
    }
}

function checkDiagonal_LeftDown(grid, color, row, col, count) {
    if (count >= 4) return true;

    if (row < MAX_ROW && col < MAX_COL && grid[row][col] != null) {
        if (grid[row][col].color == color) {
            count++;
            return checkDiagonal_LeftDown(grid, color, row + 1, col - 1, count);
        } else {
            return false;
        }
    }
}

function checkDiagonal_RightDown(grid, color, row, col, count) {
    if (count >= 4) return true;

    if (row < MAX_ROW && col < MAX_COL && grid[row][col] != null) {
        if (grid[row][col].color == color) {
            count++;
            return checkDiagonal_RightDown(grid, color, row + 1, col + 1, count);
        } else {
            return false;
        }
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