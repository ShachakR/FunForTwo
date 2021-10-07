var express = require('express')
var router = express.Router()
const path = require('path');
const fs = require('fs');

//path.joim with _dirname /(some file) gives node.js a pointer to that file
router.use(express.static(path.join(__dirname, '../frontend')));
router.use(express.static(path.join(__dirname, '../frontend/games')));

router.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } catch (err) {
        res.status(404);
        res.send('Error 404: failed to load page');
    }
});


router.get(`/game?\*`, (req, res) => {
    try {
        res.sendFile(path.join(__dirname, `../frontend/games/page.html`));
    } catch (err) {
        res.status(404);
        res.send('Error 404: failed to load page');
    }
});

module.exports = router;