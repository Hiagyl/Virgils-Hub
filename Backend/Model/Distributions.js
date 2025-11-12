const mongoose = require('mongoose');

const DistributionSchema = new mongoose.Schema({
    scholarID: {
        type: String,
        required: true,
        ref: 'Scholars'
    },
    type: {
        type: String,
        enum: ['grocery', 'allowance'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    proof: {
        type: String, // URL or file path of proof of distribution
        default: ''
    }
});

const Distributions = mongoose.model('Distribution', DistributionSchema);
module.exports = Distributions;
