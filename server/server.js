const express = require('express');
const path = require('path');
const http = require('http');
const PORT = 3000;
const socketio = require('socket.io');
const app = express();


//static folder 
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
const io = socketio(server);

//start server 
server.listen(PORT, () => {
  console.log(`server started`);
})

io.on('connection', client => {
  console.log(client.id); 
 })

app.get('/', function (req, res) {
  try {
    res.sendFile(path.join(__dirname, '../frontend/home/home.html'));
  } catch (err) {
    res.status(404);
    res.send('Error 404: failed to load page');
  }
})

app.get('/connectFour', function (req, res) {
  try {
    res.sendFile(path.join(__dirname, '../frontend/connectFour/main.html'));
  } catch (err) {
    res.status(404);
    res.send('Error 404: failed to load page');
  }
})


app.post('/joinGame', function (req, res) {
  if (games.has(req.body.game_id_input)) {
    let gameType = games.get(req.body.game_id_input);
    res.sendFile(path.join(__dirname, `../frontend/${gameType}/main.html`));
  } else {
    res.redirect('/');
  }
})

app.post('/startGame', function (req, res) {
  let gameType = req.body.gameType;
  res.redirect(`/${gameType}`);
})
