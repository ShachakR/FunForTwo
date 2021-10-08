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

    gameCode.addEventListener('click', () => {
        gameCode.classList.remove('invalid');
        gameCode.setAttribute('placeholder', "Enter Game ID");
    });

    client.on("gameFull", () => {
        gameCode.classList.add('invalid');
        gameCode.setAttribute('placeholder', "FULL!");
        gameCode.value = "";
    });

    client.on('failed_join', () => {
        gameCode.classList.add('invalid');
        gameCode.setAttribute('placeholder', "Does Not Exist!");
        gameCode.value = "";
    });

    client.on("redirect", (destination) => {
        window.location.href = destination;
    });
}