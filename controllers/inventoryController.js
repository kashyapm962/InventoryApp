var mongoose = require('mongoose');

//export the userController and devicesController.
var users = require('./users');
var devices = require('./devices');

//Connect to the database
mongoose.connect('mongodb://test:test123@ds111765.mlab.com:11765/inventory');

module.exports = function(app){

    //Fire the users Controller.
    users(app);

    //Fire the devices controller.
    devices(app);

    
};



