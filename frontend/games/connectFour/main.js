var client = io();
const gameType = "connectFour";

window.onload = function() {

    //Basic setup for every game page ****
    initializePage();
    //game frontend
    connectFourGame();
}


/**required for every game page*/
function initializePage() {
    const gameCodeLabel = document.getElementById('gameCode');
    const playersLabel = document.getElementById('players');
    const userName_Label = document.getElementById('userName_Label');
    const url_id = window.location.href.split('=')[1];
    const sidebar = document.getElementById('sidebar');
    const sidebar_homebtn = document.getElementById('home');
    const sidebar_btn = document.getElementById('sidebar-btn');

    sidebar_btn.addEventListener('click', () => {
        if (sidebar_btn.classList.contains('open')) { //hide side bar
            sidebar_btn.classList.remove('open');

            sidebar.classList.remove('sidebar_show');
            sidebar.classList.add('sidebar_hide');
        } else { //show side bar
            sidebar_btn.classList.add('open');

            sidebar.classList.remove('sidebar_hide');
            sidebar.classList.add('sidebar_show');
        }
    });

    sidebar_homebtn.addEventListener('click', () => {
        client.emit('home');
    });

    client.emit('changedPage', { 'gameType': gameType, 'url_id': url_id }); // they either join a server or create one

    client.on('joined', (data) => {
        createPlayerList(data, playersLabel);
        userName_Label.innerHTML = `Username : ${data.players[client.id]}`;
        gameCodeLabel.innerHTML = `Game Code : ${data.gameId}`;
    });

    client.on('leave', (data) => {
        createPlayerList(data, playersLabel);
    });


    client.on("redirect", (destination) => {
        window.location.href = destination;
    });
}

function createPlayerList(data, playersLabel) {
    if (playersLabel.childNodes[1]) {
        playersLabel.removeChild(playersLabel.childNodes[1]);
    }

    const players = document.createElement('ul');

    playersLabel.addEventListener('click', () => {
        if (players.id == "playersList_hide") {
            players.id = "playersList_show";
        } else {
            players.id = "playersList_hide";
        }
    });

    for (const username in data.players) {
        if (data.players.hasOwnProperty(username)) {
            const newDiv_userName = document.createElement('li');
            newDiv_userName.innerHTML = `${data.players[username]}`;
            players.appendChild(newDiv_userName);
        }
    }

    playersLabel.appendChild(players);
}
/**end*/

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
            const className = cell.id;
            var row = className.substr(5, 1);
            var col = className.substr(10, 1);

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
        state.innerHTML = `Players ${data.currentPlayers} / ${data.maxPlayers}`;
    } else {
        if (clientsTurn == client.id) {
            state.innerHTML = `Your Turn`;
        } else {
            state.innerHTML = `${data.players[clientsTurn]} Turn`;
        }
    }


    const MAX_ROW = 6;
    const MAX_COL = 7;

    for (let i = 0; i < MAX_ROW; i++) {
        for (let j = 0; j < MAX_COL; j++) {
            const chip = gameState.grid[i][j];
            if (chip != null) {
                const id = `row-${chip.row} col-${chip.col}`;
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