var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//Schema for the user Accounts.
var userSchema = new mongoose.Schema({
    Name: String,
    EmpID: String,
    Email: String,
    Mob: Number
});

//Creating models for the User Schema.
var users = mongoose.model('User',userSchema);


module.exports = function(app){
    // get request on index page.
    app.get('',function(req, res){
        res.render('index');
    });

    //User enters his/her details and wants to order some new devices.
    app.post('/profile', urlencodedParser, function(req, res){
        //Check if user already oocurs in database.
        users.count({Name: req.body.Name, EmpID: req.body.EmpID}, function(err, count){
            if (count === 0) {
                //get data from the view and add it to mongodb
                users(req.body).save(function(err){
                    if(err) throw err;
                });
            }
        });
        res.render('profile',{data:req.body});
    });

    app.get('/issueddevices', function(req, res){
        users.find('')
    });

};
