const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    expenseID: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    responsibleID: {
        type: String,
        required: true,
        ref: 'Member' // assumes this links to Members collection
    },
    receipt: {
        type: String, // could store a file path, URL, or base64 string
        default: null
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    }
});

const Expenses = mongoose.model('Expense', expenseSchema);

module.exports = Expenses;
