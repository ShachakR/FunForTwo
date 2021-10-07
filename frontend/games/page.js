var client = io(); // initialize client 

window.onload = function() {
    const gameType = window.location.href.split('?')[1].split('=')[0];

    //Basic setup for every game page ****
    initializePage(gameType);
    loadGameFiles(gameType);
}

function loadGameFiles(gameType) {
    const gameScript = document.createElement("script");
    gameScript.src = `${gameType}/main.js`;
    gameScript.type = "text/javascript";

    const gameCSS = document.createElement("link");
    gameCSS.rel = "stylesheet";
    gameCSS.href = `${gameType}/main.css`;
    gameCSS.type = "text/css";

    document.head.append(gameScript);
    document.head.append(gameCSS);
}

//gameType : String  
function initializePage(gameType) {
    initSideBar(gameType);
    initClientCalls(gameType);
}

function initSideBar(gameType) {
    const sidebar = document.getElementById('sidebar');
    const sidebar_btn = document.getElementById('sidebar-btn');
    const title = document.getElementById('sidebar-title');

    title.innerHTML = gameType.charAt(0).toUpperCase() + gameType.slice(1);

    sidebar.classList.add('sidebar_hide');
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
}

function initClientCalls(gameType) {
    const gameCodeLabel = document.getElementById('gameCode');
    const userName_Label = document.getElementById('userName');
    const url_id = window.location.href.split('=')[1];
    const sidebar_homebtn = document.getElementById('home');

    sidebar_homebtn.addEventListener('click', () => {
        client.emit('home');
    });

    client.emit('changedPage', { 'gameType': gameType, 'url_id': url_id }); // they either join a server or create one

    client.on('joined', (data) => {
        userName_Label.innerHTML = `Username: ${data.players[client.id]}`;
        gameCodeLabel.innerHTML = `Game Code: ${data.gameId}`;
        updatePage(data);
    });

    client.on('leave', (data) => {
        updatePage(data);
    });


    client.on("redirect", (destination) => {
        window.location.href = destination;
    });
}

function updatePage(data) {
    const playersLabel = document.getElementById('players');
    updatePlayerList(data, playersLabel);
    updateWaitingInfo(data);
}

function updatePlayerList(data, playersLabel) {
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

function updateWaitingInfo(data) {
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
}