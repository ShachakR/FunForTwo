const gameType = "battleShip";
const WDITH = 10;

loadGame();

function loadGame() {

}

function createElements() {
    const gameScreen = document.getElementById("gameScreen-Container");
    const canvas = document.createElement("div");
    canvas.id = "canvas";

    for (let r = 0; r < WDITH; r++) {
        for (let c = 0; c < WDITH; c++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `row-${r} col-${c}`;
            canvas.appendChild(cell);
        }
    }
    gameScreen.appendChild(canvas);
}