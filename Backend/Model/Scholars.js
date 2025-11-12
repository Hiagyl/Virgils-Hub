const mongoose = require('mongoose');

const ScholarSchema = new mongoose.Schema({
    scholarID: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true
    },
    picture: {
        type: String, // URL or file path to the scholar's picture
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'graduate', 'inactive'],
        default: 'active'
    },
    degreeProgram: {
        type: String,
        required: true
    },
    yearLevel: {
        type: Number,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Scholar', ScholarSchema);
