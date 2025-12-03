const Donations = require('../models/Donation');
const Donors = require('../models/Donor'); // Only needed if you check donors

// Create donation
exports.createDonation = async (req, res) => {
    try {
        const { donorID, amount, mode, remarks, description, receipt } = req.body;

        // Validate donor exists
        const donor = await Donors.findById(donorID);
        if (!donor) {
            return res.status(404).json({ message: "Donor not found" });
        }

        const donation = new Donations({
            donorID,
            amount,
            mode,
            remarks,
            description,
            receipt
        });

        await donation.save();
        res.status(201).json(donation);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all donations
exports.getDonations = async (req, res) => {
    try {
        const donations = await Donations.find().populate("donorID");
        res.json(donations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
