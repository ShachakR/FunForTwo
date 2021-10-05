var client = io(); // initialize client 

//gameType : String  
function initializePage(gameType) {

    createElements(gameType);

    const gameCodeLabel = document.getElementById('gameCode');
    const playersLabel = document.getElementById('players');
    const userName_Label = document.getElementById('userName');
    const url_id = window.location.href.split('=')[1];
    const sidebar = document.getElementById('sidebar');
    const sidebar_homebtn = document.getElementById('home');
    const sidebar_btn = document.getElementById('sidebar-btn');

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

function createElements(gameType) {
    const pageNav = document.createElement("div");
    pageNav.setAttribute("id", "page-Nav");

    const nav = createNavBar();
    const sidebar = createSideBar(gameType);
    pageNav.appendChild(nav);
    pageNav.appendChild(sidebar);


    //First elements in body
    document.body.prepend(pageNav);
}


function createNavBar() {
    const nav = document.createElement('div');
    nav.setAttribute("id", "nav");

    const nav_btn = document.createElement("div");
    nav_btn.setAttribute("id", "sidebar-btn");
    nav_btn.setAttribute("class", "sidebar-btn");

    const nav_burger = document.createElement("div");
    nav_burger.setAttribute("class", "sidebar-btn_burger");

    nav_btn.appendChild(nav_burger)
    nav.appendChild(nav_btn);

    return nav;
}

function createSideBar(gameType) {
    const title = gameType.charAt(0).toUpperCase() + gameType.slice(1);

    const sidebar = document.createElement('div');
    sidebar.setAttribute("id", "sidebar");
    sidebar.setAttribute("class", "sidebar");

    const sideBarTitle = document.createElement("h4");
    sideBarTitle.innerHTML = title;

    const username = document.createElement("h5");
    username.setAttribute("id", "userName");

    const gameCode = document.createElement("h5");
    gameCode.setAttribute("id", "gameCode");

    const sidebarList = document.createElement("ul");

    const homeBtn = document.createElement("li");
    homeBtn.innerHTML = "Home";
    homeBtn.setAttribute("id", "home");
    homeBtn.setAttribute("class", "sidebar_item");

    const playerList = document.createElement("li");
    playerList.innerHTML = "Players";
    playerList.setAttribute("id", "players");
    playerList.setAttribute("class", "sidebar_item");

    sidebarList.appendChild(homeBtn);
    sidebarList.appendChild(playerList);

    sidebar.appendChild(sideBarTitle);
    sidebar.appendChild(username);
    sidebar.appendChild(gameCode);
    sidebar.appendChild(sidebarList);

    return sidebar;
}