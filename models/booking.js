const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    packageType: String,
    name: String,
    phone: String,
    location: String,
    adults: Number,
    children: Number,
    days: Number,
    totalPrice: Number,
    checkInDate: Date,
    checkOutDate: Date,
    bookingDate: Date,
    canceled: { type: Boolean, default: false },
    confirmed: { type: Boolean, default: false },  // Confirmed status
});


module.exports = mongoose.model("Booking", bookingSchema);
