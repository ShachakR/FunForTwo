var client = io();

window.onload = function() {

    //Consts 
    const joinGameBtn = document.getElementById('joinGame_btn');
    const createGameBtn = document.getElementById('createGame_btn');
    const gameType = document.getElementById('gameType');
    const gameCode = document.getElementById('gameCode');

    //set up
    createGameBtn.addEventListener('click', newGame);
    joinGameBtn.addEventListener('click', joinGame);

    function newGame() {
        client.emit('newGame', gameType.value);
    }

    function joinGame() {
        client.emit('joinGame', gameCode.value);
    }

    client.on("connect", () => {
        console.log('connected');
    });

    client.on("gameFull", () => {
        alert('Game Room is Full');
    });

    client.on('failed_join', () => {
        alert('Game does not exist');
    });

    client.on("redirect", (destination) => {
        window.location.href = destination;
    });
}