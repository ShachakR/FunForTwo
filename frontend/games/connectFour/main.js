const gameType = "connectFour";
const MAX_ROW = 6;
const MAX_COL = 7;

loadGame();

/**Connect Four frontend*/
function loadGame() {
    createElements();
    initalizeButtons();

    // data is the gameSession object
    client.on('CF_update', (data) => {
        updateGame(data);
    });

    client.on('joined', (data) => {
        if (data.gameType == gameType) {
            updateGame(data)
        }
    });

    client.on('leave', (data) => {
        if (data.gameType == gameType) {
            updateGame(data)
        }
    });

}


function createElements() {
    const canvas = document.getElementById("canvas");
    canvas.id = "canvas";

    for (let r = 0; r < MAX_ROW; r++) {
        for (let c = 0; c < MAX_COL; c++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `row-${r} col-${c}`;
            canvas.appendChild(cell);
        }
    }
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

function updateGame(data) {
    updatePage(data);
    let gameState = data.gameState;

    for (let i = 0; i < MAX_ROW; i++) {
        for (let j = 0; j < MAX_COL; j++) {
            const chip = gameState.grid[i][j];
            const id = `row-${i} col-${j}`;
            const cell = document.getElementById(`${id}`);
            if (chip != null) {
                cell.style.backgroundColor = chip.color;
            } else {
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
        } else if (gameState.tie) {
            popup_title.innerHTML = "TIE GAME!";
        } else {
            popup_title.innerHTML = "YOU LOST";
        }
    } else {
        popup.className = "popup-hide";
    }
}