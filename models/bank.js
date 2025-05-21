// // // // // bank.js
const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    pin: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 30000
    }
});

module.exports = mongoose.model("Bank", bankSchema);
