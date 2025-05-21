const mongoose = require("mongoose");
const Booking = require("../models/booking.js");

module.exports.createBooking = async function (req, res) {
    try {
        console.log("✅ User authenticated:", !!req.user);
        console.log("📦 Incoming form data:", req.body);

        // Validate and parse check-in/check-out dates (safe parsing)
        const [cinY, cinM, cinD] = req.body.checkin.split('-');
        const [coutY, coutM, coutD] = req.body.checkout.split('-');
        const checkinDate = new Date(Date.UTC(+cinY, +cinM - 1, +cinD));
        const checkoutDate = new Date(Date.UTC(+coutY, +coutM - 1, +coutD));

        console.log("📅 Final Check-in:", checkinDate.toISOString());
        console.log("📅 Final Check-out:", checkoutDate.toISOString());

        // Validation for invalid dates
        if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
            console.log("❌ Invalid check-in or check-out date.");
            return res.redirect("/booking-page");
        }

        // Ensure valid ObjectId
        const listing = mongoose.Types.ObjectId(req.params.listingId);
        const user = mongoose.Types.ObjectId(req.user._id);

        // Calculate total price
        const totalPrice = calculateTotalPrice(req.body);
        console.log("💰 Calculated total price:", totalPrice);

        // Create booking document
        // Create booking object without checkin/checkout yet
        const booking = new Booking({
            listing,
            user,
            name: req.body.name,
            phone: req.body.phone,
            location: req.body.location,
            adults: parseInt(req.body.adults),
            children: parseInt(req.body.children),
            days: parseInt(req.body.days),
            packageType: req.body.packageType,
            totalPrice
        });

        // Now assign checkin and checkout explicitly
        booking.checkin = checkinDate;
        booking.checkout = checkoutDate;

        console.log("✅ Final Booking object:", booking.toObject());

        console.log("⏱ Checkin (final):", booking.checkin);
        console.log("⏱ Checkout (final):", booking.checkout);



        await booking.save();

        console.log("✅ Booking saved successfully");

        res.redirect("/success-page");

    } catch (err) {
        console.error("❌ Error in createBooking controller:", err);
        res.status(500).send("Internal Server Error");
    }
};

