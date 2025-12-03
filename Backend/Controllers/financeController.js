const Donations = require("../Model/Donations");
const Expenses = require("../Model/Expenses");

// Fetch all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const donations = await Donations.find();
    const expenses = await Expenses.find();

    const records = [
      ...donations.map(d => ({ ...d.toObject(), type: 'donation', date: d.dateReceived })),
      ...expenses.map(e => ({ ...e.toObject(), type: 'expense', date: e.date }))
    ];

    // Sort descending by date
    res.json(records.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, description, amount, date } = req.body;

    let record;

    if (type === "donation") {
      record = new Donations({
        donorID: "unknown",
        amount,
        dateReceived: date,
        description,
        mode: "cash"
      });
      await record.save();
    } else if (type === "expense") {
      record = new Expenses({
        responsibleID: "unknown",
        amount,
        date,
        remarks: description
      });
      await record.save();
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    res.json({ ...record.toObject(), type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, amount, date } = req.body;

    let record;

    if (type === "donation") {
      record = await Donations.findByIdAndUpdate(
        id,
        { description, amount, dateReceived: date },
        { new: true }
      );
    } else if (type === "expense") {
      record = await Expenses.findByIdAndUpdate(
        id,
        { remarks: description, amount, date },
        { new: true }
      );
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    res.json({ ...record.toObject(), type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (type === "donation") {
      await Donations.findByIdAndDelete(id);
    } else if (type === "expense") {
      await Expenses.findByIdAndDelete(id);
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
