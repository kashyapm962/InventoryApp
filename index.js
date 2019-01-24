var express = require('express');
var inventoryController = require('./controllers/inventoryController');

var app = express();

//set up template engines
app.set('view engine','ejs');

//static files
app.use(express.static('./public'));

//Fire Controllers
inventoryController(app);


//Configure the port
app.listen(3000);
console.log('You are listening to port 3000');

