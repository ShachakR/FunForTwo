var client = io();
const gameType = "connectFour";

window.onload = function() {

    //Basic setup for every game page ****
    initializePage();
}

function initializePage() {
    const gameCodeLabel = document.getElementById('gameCode');
    const playerCountLabel = document.getElementById('playerCount');
    const userName_Label = document.getElementById('userName_Label');
    const url_id = window.location.href.split('=')[1];

    client.emit('changedPage', { 'gameType': gameType, 'url_id': url_id }); // they either join a server or create one

    client.on('joined', (data) => {
        playerCountLabel.innerHTML = data.currentPlayers;
        gameCodeLabel.innerHTML = `Game Code = ${data.gameId}`;
    });

    client.on('setUserName', userName => {
        userName_Label.innerHTML = `UserName : ${userName}`;
    });

    client.on('leave', (data) => {
        playerCountLabel.innerHTML = data.currentPlayers;
    });


    client.on("redirect", (destination) => {
        window.location.href = destination;
    });
}