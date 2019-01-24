var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//Schema for the devices.
var deviceSchema = new mongoose.Schema({
    DeviceID : { type: String, unique: true },
    DeviceName : String,
    IssuedOn : { type: Date, default: Date.now },
    ReturnDate : { type: Date, default: Date.now },
    EmpID : { type : String, required : false },
    Status : { type: Boolean, default: false }
});

//Creating models for the Devices Schema
var devices = mongoose.model('Devices',deviceSchema);

module.exports = function(app){
    app.get('/devices', function(req, res){
        devices.find({EmpID: req.query.emp}, function(err, data){
            res.render('devices',{data:data});
        });
    });

    app.get('/newdevice', function(req, res){
        devices.find().distinct('DeviceName', function(err, uniqueDevices){
            if (err) throw err;
            res.render('adddevice', {deviceList : uniqueDevices, emp: req.query.emp});
        });
    });

    app.post('/newdevice', urlencodedParser, function(req, res){
        devices.findOneAndUpdate({DeviceName: req.body.DeviceName, Status: false},
            {IssuedOn: Date.now(), ReturnDate: req.body.ReturnDate, Status: true, EmpID: req.query.emp },
            function(err, data){
                if (err){
                    throw err;
                }
                if(!data){
                    devices.find({DeviceName: req.body.DeviceName}, function(err, data){
                        res.render('deviceNotAvailable');
                    });
                }
            });
        
    });

    app.get('/addnewdevice', function(req, res){
        res.render('addnewdevice');
    });

    app.post('/addnewdevice', urlencodedParser, function(req, res){
        devices(req.body).save(function(err){
            if (err) throw err;
        });
        res.render('addnewdevice');
    });

};