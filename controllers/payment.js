const Bank = require('../models/bank');
const Booking = require('../models/booking');

module.exports.makePayment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { pin } = req.body;
        const bookingId = req.params.bookingId;

        // Find bank record of the current user
        const bankAccount = await Bank.findOne({ user: userId });
        if (!bankAccount) {
            req.flash("error", "Bank account not found.");
            return res.redirect("back");
        }

        // Compare entered PIN with stored PIN (plain text)
        if (pin !== bankAccount.pin) {
            req.flash("error", "Invalid PIN.");
            return res.redirect("back");
        }

        // Get booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            req.flash("error", "Booking not found.");
            return res.redirect("back");
        }

        if (booking.isPaid) {
            req.flash("error", "This booking is already paid.");
            return res.redirect("back");
        }

        // Check balance
        if (bankAccount.balance < booking.totalPrice) {
            req.flash("error", "Insufficient balance.");
            return res.redirect("back");
        }

        // Deduct amount
        bankAccount.balance -= booking.totalPrice;
        await bankAccount.save();

        // Mark booking as paid
        booking.isPaid = true;
        await booking.save();

        req.flash("success", "Payment successful!");
        res.redirect("/history");
    } catch (err) {
        console.error("💥 Payment Error:", err);
        req.flash("error", "Payment failed. Try again.");
        res.redirect("back");
    }
};
