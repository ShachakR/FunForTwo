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
    const pageContent = document.getElementById('pageContent-Container');

    title.innerHTML = gameType.charAt(0).toUpperCase() + gameType.slice(1);

    sidebar.classList.add('hide');
    sidebar_btn.addEventListener('click', sideBarOpener);

    function sideBarOpener() {
        if (sidebar_btn.classList.contains('open')) { //hide side bar
            sidebar_btn.classList.remove('open');
            elementHideShow(sidebar);
        } else { //show side bar
            sidebar_btn.classList.add('open');
            elementHideShow(sidebar);
        }
    }

    /**Edit username functions*/
    const edit = document.getElementById('usredit');
    const done = document.getElementById('popup-done');
    const cancel = document.getElementById('popup-cancel');

    const editPopup = document.getElementById('edit-popup');
    const input = document.getElementById('edit_input');

    edit.addEventListener('click', () => {
        input.classList.remove('invalid');
        elementHideShow(editPopup);
    });

    done.addEventListener('click', () => {
        input.addEventListener('click', () => {
            input.classList.remove('invalid');
        });
        if (input.value.trim().length > 0) {
            client.emit('usrnameChange', input.value);
            let userName_Label = document.getElementById('userName');
            userName_Label.innerHTML = `Username: ${input.value}`;
            elementHideShow(editPopup);
        } else {
            input.classList.add('invalid');
        }
    });

    cancel.addEventListener('click', () => {
        elementHideShow(editPopup);
        input.classList.remove('invalid');
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

    client.on('updatePage', (data) => {
        updatePage(data);
    });
}

function updatePage(data) {
    updatePlayerList(data);
    updateWaitingInfo(data);
}

function updatePlayerList(data) {
    const playersLabel = document.getElementById('players');
    var currentClass = "";

    if (playersLabel.childNodes[1]) {
        currentClass = playersLabel.childNodes[1].className;
        playersLabel.removeChild(playersLabel.childNodes[1]);
    }

    const playerList = document.createElement('ul');
    if (currentClass != "") { //set the classname to what it was pre-update 
        playerList.className = currentClass;
    } else { //otherwise hide playerList on init 
        playerList.classList.add('playerList');
        playerList.classList.add('hide');
    }

    playersLabel.addEventListener('click', () => {
        elementHideShow(playerList);
        elementHideShow(playersLabel);
    });

    for (const username in data.players) {
        if (data.players.hasOwnProperty(username)) {
            const newDiv_userName = document.createElement('li');
            newDiv_userName.innerHTML = `${data.players[username]}`;
            playerList.appendChild(newDiv_userName);
        }
    }

    playersLabel.appendChild(playerList);
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



function elementHideShow(element) {
    if (element.classList.contains('hide')) {
        element.classList.remove('hide');

        element.classList.add('show');
    } else {
        element.classList.remove('show');
        element.classList.add('hide');
    }
}