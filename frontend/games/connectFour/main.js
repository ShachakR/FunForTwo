var client = io();
const gameType = "connectFour";

window.onload = function(){ 
    const gameCodeLabel = document.getElementById('gameCode');
    const playerCountLabel = document.getElementById('playerCount');
    const location  = window.location.href.split('=')[1];

    client.emit('changedPage', { 'gameType' : gameType, 'location' : location});

    client.on('joined', (data) => {
        playerCountLabel.innerHTML = data.currentPlayers;
        gameCodeLabel.innerHTML = `Game Code = ${data.gameId}`; 
    });
}