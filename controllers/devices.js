var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const multer = require('multer');

var devices = require('../models/modeldevices').devices;
var users = require('../models/modelusers');
var requiresLogin = require('../middleware/middleware');


// Set storage engine
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {        
        // null as first argument means no error
        cb(null, Date.now() + '-' + file.originalname )
    }
})

// Init upload
const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1000000
    },

    fileFilter: function (req, file, cb) {
        sanitizeFile(file, cb);
    }
}).single('files')

//Validating filetype and mimetype
function sanitizeFile(file, cb) {
    // Define the allowed extension
    let fileExts = ['png', 'jpg', 'jpeg', 'gif']

    // Check allowed extensions
    let isAllowedExt = fileExts.includes(file.originalname.split('.')[1].toLowerCase());
    // Mime type must be an image
    let isAllowedMimeType = file.mimetype.startsWith("image/")

    if (isAllowedExt && isAllowedMimeType) {
        return cb(null, true) // no errors
    }
    else {
        // pass error msg to callback, which can be displaye in frontend
        cb('Error: File type not allowed!')
    }
}



module.exports = function(app){

    // get request for issue new device page
    app.get('/issuenewdevice',requiresLogin, function(req, res){
        devices.find(function(err, uniqueDevices){
            if (err) throw err;
            res.render('issuenewdevice', {data:uniqueDevices});
        });
    });

    // post request for search feature
    app.post('/issuenewdevice',urlencodedParser, requiresLogin, function(req, res){
        devices.find({DeviceName: RegExp(req.body.search,'i')}, function(err, uniqueDevices){
            if (err) throw err;
            res.render('issuenewdevice', {data:uniqueDevices});
        });
    });

    // after clicking on available button.
    app.get('/available', urlencodedParser, requiresLogin, function(req, res){
        res.render('returndevice',{data :req.query.deviceid});
    });

    //after clicking on unavailable button.
    app.get('/notavailable', urlencodedParser, requiresLogin, function(req, res){
        devices.
            findOne({DeviceID: req.query.deviceid}).
            populate('Emp').
            exec (function (err, device){
                if (err) throw err;
                res.render('devicenotavailable', {data: device.Emp});
            });
    });

    // to show all the devices to the user.
    app.get('/mydevices', function(req, res){
        devices.find({Emp: req.session.userId}, function(err, device){
            res.render('mydevices', {data: device});
        });
                
    });

    //to add new devices which have been issued to the user
    app.post('/mydevices', urlencodedParser, requiresLogin, function(req, res){
        users.findOne({_id: req.session.userId}, function(err, user){
            if (err) throw err;
            if (req.body.ReturnDate){
                devices.findOneAndUpdate({DeviceID: req.query.deviceid},
                    {IssuedOn: Date.now(), ReturnDate: req.body.ReturnDate, Status: true, Emp: user },
                    function(err){
                        if (err){
                            throw err;
                        }
                        res.redirect('/mydevices');
                });
            }else {

            }
            
        });        
    });

    //get request to add new devices in the inventory.
    app.get('/addnewdevice', function(req, res){
        res.render('addnewdevice');
    });

    //post request to add new devices in the inventory
    app.post('/addnewdevice', urlencodedParser, function(req, res){
        var filename;
        upload(req, res, (err) => {
            if (err){ 
                res.render('addnewdevice', { msg: err})
            }else{
                // If file is not selected
                if (req.file === undefined) {
                    res.render('addnewdevice', { msg: 'No file selected!' });
                }
                else{
                    devices({DeviceName: req.body.DeviceName, DeviceID: req.body.DeviceID, filePath: '/uploads/'+req.file.filename}).save();
                    res.render('addnewdevice', { msg: 'File uploaded successfully!' });
                }
            }
        });
    });

    app.get('/returndevice', requiresLogin, function(req, res){
        devices.findOneAndUpdate({DeviceID: req.query.deviceid},
            {ReturnDate: Date.now(), Status: false, Emp: null },
            function(err){
                if (err){
                    throw err;
                }
                res.redirect('/mydevices');      
        });      
    });
}
