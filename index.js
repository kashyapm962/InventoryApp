var express = require('express');
var session = require('express-session');
var inventoryController = require('./controllers/inventoryController');

var app = express();

//set up template engines
app.set('view engine','ejs');

//static files
app.use(express.static('./public'));

//use sessions for tracking logins
app.use(session({
    secret: 'secrets_are_to_be_stored_here',
    resave: true,
    saveUninitialized: false
}));

//Fire Controllers
inventoryController(app);


//Configure the port
app.listen(3000);
console.log('You are listening to port 3000');

