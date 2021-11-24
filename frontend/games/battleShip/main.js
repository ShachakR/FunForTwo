const gameType = "battleShip";
const WDITH = 10;

loadGame();

function loadGame() {
    createElements();
}

function createElements() {
    const gameScreen = document.getElementById("gameScreen-Container");

    const clientGrid = document.createElement("div");
    clientGrid.id = "client-grid";
    clientGrid.classList.add("canvas");

    const otherGrid = document.createElement("div");
    otherGrid.id = "other-grid";
    otherGrid.classList.add("canvas");
    otherGrid.classList.add("other");

    for (let r = 0; r < WDITH; r++) {
        for (let c = 0; c < WDITH; c++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `row-${r} col-${c}`;
            clientGrid.appendChild(cell);
            otherGrid.appendChild(cell.cloneNode(false));
        }
    }

    gameScreen.appendChild(clientGrid);
}