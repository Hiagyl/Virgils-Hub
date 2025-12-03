const Expenses = require('../models/Expense');
const Members = require('../models/Member'); // Only needed if validating responsibleID

// CREATE expense
exports.createExpense = async (req, res) => {
    try {
        const { amount, date, responsibleID, receipt, remarks } = req.body;

        // Optional: Validate responsible member exists
        const member = await Members.findById(responsibleID);
        if (!member) {
            return res.status(404).json({ message: "Responsible member not found" });
        }

        const expense = new Expenses({
            amount,
            date,
            responsibleID,
            receipt,
            remarks
        });

        await expense.save();
        res.status(201).json(expense);

    } catch (error) {
        console.error("Create Expense Error:", error);
        res.status(500).json({ message: "Server error creating expense" });
    }
};

// GET all expenses
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expenses
            .find()
            .populate("responsibleID"); // Optional: return full member data

        res.json(expenses);

    } catch (error) {
        console.error("Get Expenses Error:", error);
        res.status(500).json({ message: "Server error fetching expenses" });
    }
};

// GET one expense
exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expenses.findById(req.params.id)
            .populate("responsibleID");

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json(expense);

    } catch (error) {
        console.error("Get Expense Error:", error);
        res.status(500).json({ message: "Server error fetching expense" });
    }
};

// UPDATE expense
exports.updateExpense = async (req, res) => {
    try {
        const updatedExpense = await Expenses.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json(updatedExpense);

    } catch (error) {
        console.error("Update Expense Error:", error);
        res.status(500).json({ message: "Server error updating expense" });
    }
};

// DELETE expense
exports.deleteExpense = async (req, res) => {
    try {
        const deletedExpense = await Expenses.findByIdAndDelete(req.params.id);

        if (!deletedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json({ message: "Expense deleted successfully" });

    } catch (error) {
        console.error("Delete Expense Error:", error);
        res.status(500).json({ message: "Server error deleting expense" });
    }
};
