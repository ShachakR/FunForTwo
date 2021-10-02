var client = io();
const gameType = "connectFour";

window.onload = function() {

    //Basic setup for every game page ****
    initializePage();

    //game frontend
    connectFourGame();
}

/**Connect Four frontend*/
function connectFourGame() {
    initalizeButtons();

    // data is the gameSession object
    client.on('CF_update', (data) => {
        update(data);
    });

    client.on('joined', (data) => {
        if (data.gameType == gameType) {
            update(data)
        }
    });

    client.on('leave', (data) => {
        if (data.gameType == gameType) {
            update(data)
        }
    });

}

function initalizeButtons() {
    const cells = document.getElementsByClassName('cell');
    const cellArr = Object.values(cells);

    cellArr.forEach(cell => {
        cell.addEventListener('click', () => {
            const idName = cell.id;
            var row = parseInt(idName.substr(4, 1));
            var col = parseInt(idName.substr(10, 1));

            client.emit('CF_click', { 'row': row, 'col': col });
        });
    });

    const popup_restart = document.getElementById('popup-restart');

    popup_restart.addEventListener('click', () => {
        client.emit('CF_restart');
    });
}

function update(data) {
    let gameState = data.gameState;
    let clientsTurn = gameState.players[gameState.playerTurn]; // is a client id
    const state = document.getElementById('state');

    if (data.currentPlayers != data.maxPlayers) {
        state.innerHTML = `Waiting For Players... ${data.currentPlayers}/${data.maxPlayers}`;
        state.style.color = "#ff3f34";
    } else {
        if (clientsTurn == client.id) {
            state.innerHTML = `Your Turn`;
            state.style.color = "#05c46b";

        } else {
            state.innerHTML = `${data.players[clientsTurn]} Turn`;
            state.style.color = "#ff3f34";
        }
    }

    const MAX_ROW = 6;
    const MAX_COL = 7;

    for (let i = 0; i < MAX_ROW; i++) {
        for (let j = 0; j < MAX_COL; j++) {
            const chip = gameState.grid[i][j];
            if (chip != null) {
                const id = `row-${i} col-${j}`;
                const cell = document.getElementById(`${id}`);
                cell.style.backgroundColor = chip.color;
            } else {
                const id = `row-${i} col-${j}`;
                const cell = document.getElementById(`${id}`);
                cell.style.backgroundColor = "white";
            }
        }
    }

    const popup = document.getElementById('gameOver-popup');
    if (gameState.gameOver) {
        popup.className = "popup-show";
        const popup_title = document.getElementById('popup-title');
        if (gameState.winner == client.id) {
            popup_title.innerHTML = "YOU WON!";
        } else {
            popup_title.innerHTML = "YOU LOST";
        }
    } else {
        popup.className = "popup-hide";
    }
}