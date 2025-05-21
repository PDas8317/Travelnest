const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const { isLoggedIn } = require("../middleware");

// GET: Show booking history
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("listing");

        res.render("booking/history", { bookings, user: req.user });
    } catch (error) {
        req.flash("error", "Unable to fetch booking history.");
        res.redirect("/dashboard");
    }
});

// POST: Cancel a booking by ID
router.post("/cancel/:bookingId", isLoggedIn, async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            req.flash("error", "Booking not found.");
            return res.redirect("/booking/history");
        }

        if (!booking.user.equals(req.user._id)) {
            req.flash("error", "You do not have permission to cancel this booking.");
            return res.redirect("/booking/history");
        }

        if (booking.canceled) {
            req.flash("error", "Booking is already canceled.");
            return res.redirect("/booking/history");
        }

        const now = new Date();
        const bookingDate = new Date(booking.bookingDate);
        const cancelDeadline = new Date(bookingDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        if (now > cancelDeadline) {
            req.flash("error", "Cancellation period has expired.");
            return res.redirect("/booking/history");
        }

        booking.canceled = true;
        booking.refundAmount = Math.floor(booking.totalPrice * 0.9);
        await booking.save();

        req.flash("success", "Booking canceled successfully. Refund of 90% will be processed.");
        res.redirect("/booking/history");
    } catch (err) {
        console.error(err);
        req.flash("error", "Error canceling booking.");
        res.redirect("/booking/history");
    }
});

module.exports = router;
