const Distribution = require("../Model/Distributions");
const Scholar = require("../Model/Scholars");

// =============================
// GET ALL DISTRIBUTIONS
// =============================
exports.getAll = async (req, res) => {
    try {
        const distributions = await Distribution.find()
            .populate("scholarID", "fullname degreeProgram yearLevel contactNo");

        res.status(200).json(distributions);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving distributions", error });
    }
};

// =============================
// GET DISTRIBUTION BY ID
// =============================
exports.getById = async (req, res) => {
    try {
        const distribution = await Distribution.findById(req.params.id)
            .populate("scholarID", "fullname degreeProgram yearLevel contactNo");

        if (!distribution) {
            return res.status(404).json({ message: "Distribution not found" });
        }

        res.status(200).json(distribution);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving distribution", error });
    }
};

// =============================
// CREATE NEW DISTRIBUTION
// =============================
exports.create = async (req, res) => {
    try {
        const { scholarID, type, amount, location, proof } = req.body;

        // Check for missing fields
        if (!scholarID || !type || !amount || !location) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate scholar exists
        const scholar = await Scholar.findById(scholarID);
        if (!scholar) {
            return res.status(404).json({ message: "Scholar not found" });
        }

        const newDistribution = new Distribution({
            scholarID,
            type,
            amount,
            location,
            proof
        });

        await newDistribution.save();

        res.status(201).json({
            message: "Distribution recorded successfully",
            newDistribution
        });

    } catch (error) {
        res.status(400).json({ message: "Error creating distribution", error });
    }
};

// =============================
// UPDATE DISTRIBUTION BY ID
// =============================
exports.update = async (req, res) => {
    try {
        const { scholarID } = req.body;

        // If updating scholarID, ensure scholar exists
        if (scholarID) {
            const scholar = await Scholar.findById(scholarID);
            if (!scholar) {
                return res.status(404).json({ message: "Scholar not found" });
            }
        }

        const updatedDistribution = await Distribution.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedDistribution) {
            return res.status(404).json({ message: "Distribution not found" });
        }

        res.status(200).json({
            message: "Distribution updated successfully",
            updatedDistribution
        });

    } catch (error) {
        res.status(400).json({ message: "Error updating distribution", error });
    }
};

// =============================
// DELETE DISTRIBUTION BY ID
// =============================
exports.delete = async (req, res) => {
    try {
        const deleted = await Distribution.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Distribution not found" });
        }

        res.status(200).json({ message: "Distribution deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error deleting distribution", error });
    }
};
