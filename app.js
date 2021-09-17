const express = require('express');
const path = require('path');
const app = express(); // not using keyword 'new' puts this on the global window
const port = 3000; 

app.use(express.static("frontend"));

app.get('/', function (req, res) {
    try{
        res.sendFile(path.join(__dirname,'frontend/home/home.html'));
    }catch(err){
        res.status(404);
        res.send('Error 404: failed to load page');
    }
    
  })
   
  app.listen(port, () => {
    console.log(`server started`);
  })

