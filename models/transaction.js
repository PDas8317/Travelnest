const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },
    amount: Number,
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Success", "Failed"],
        default: "Success"
    }
});

module.exports = mongoose.model("Transaction", transactionSchema);
