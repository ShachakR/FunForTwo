var client = io();

window.onload = function(){ 
//Consts 
const joinGameBtn = document.getElementById('joinGame_btn');
var createGameBtn = document.getElementById('createGame_btn');
const initialScreen = document.getElementById('initialScreen');
const gameScreen = document.getElementById('gameScreen');

//set up

createGameBtn.addEventListener('click', newGame); 

function newGame(){
    client.emit('newGame');
    init();
}

function init(){
    initialScreen.style.display  = "none";
    gameScreen.style.display  = "block";
}

client.on("connect", () => {
    console.log('connected');
});   
}