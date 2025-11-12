const mongoose = require('mongoose');

const DistributionSchema = new mongoose.Schema({
    distributionID: {
        type: String,
        required: true,
        unique: true
    },
    scholarID: {
        type: String,
        required: true,
        ref: 'Scholar'
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
