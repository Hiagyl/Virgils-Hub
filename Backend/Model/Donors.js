const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
    donorID: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    }
});

const Donors = mongoose.model('Donor', DonorSchema);
module.exports = Donors;
