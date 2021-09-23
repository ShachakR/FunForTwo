var express = require('express')
var router = express.Router()
const path = require('path');

//path.joim with _dirname /(some file) gives node.js a pointer to that file
router.use(express.static(path.join(__dirname, '../frontend')));
router.use(express.static(path.join(__dirname, '../frontend/games/connectFour')));

router.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } catch (err) {
        res.status(404);
        res.send('Error 404: failed to load page');
    }
});

router.get(`/game_connectFour=\*`, (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend/games/connectFour/main.html'));
    } catch (err) {
        res.status(404);
        res.send('Error 404: failed to load page');
    }
});

module.exports = router;