var mongoose = require('mongoose');

//Schema for the devices.
var deviceSchema = new mongoose.Schema({
    DeviceID : { type: String, unique: true },
    DeviceName : String,
    IssuedOn : { type: Date, default: Date.now },
    ReturnDate : { type: Date, default: Date.now },
    Emp: { type: mongoose.Schema.Types.ObjectId, ref:'User'},
    Status : { type: Boolean, default: false },
    filePath : String
});

//Creating models for the Devices Schema
module.exports.devices = mongoose.model('Devices',deviceSchema);
