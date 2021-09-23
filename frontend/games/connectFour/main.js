var client = io();
const gameType = "connectFour";

window.onload = function() {

    //Basic setup for every game page ****
    initializePage();
}

function initializePage() {
    const gameCodeLabel = document.getElementById('gameCode');
    const playersLabel = document.getElementById('players');
    const userName_Label = document.getElementById('userName_Label');
    const url_id = window.location.href.split('=')[1];
    const sidebar_homebtn = document.getElementById('home');

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