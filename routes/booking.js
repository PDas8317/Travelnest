
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Bank = require("../models/bank");

const { isLoggedIn } = require("../middleware");
const moment = require("moment");

const bcrypt = require("bcrypt");




// GET booking history
router.get("/history", isLoggedIn, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("listing")
            .sort({ bookingDate: -1 });

        res.render("booking/history", { bookings });
    } catch (err) {
        req.flash("error", "Could not retrieve booking history.");
        res.redirect("/listing");
    }
});

// GET cancel booking
router.get("/cancel/:bookingId", isLoggedIn, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            req.flash("error", "Booking not found.");
            return res.redirect("/booking/history");
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized cancellation attempt.");
            return res.redirect("/booking/history");
        }

        if (booking.canceled) {
            req.flash("error", "Booking is already canceled.");
            return res.redirect("/booking/history");
        }

        const diffDays = moment().diff(moment(booking.bookingDate), 'days');
        if (diffDays <= 7) {
            // ✅ Refund logic
            const bankAccount = await Bank.findOne({ user: req.user._id });
            if (bankAccount) {
                bankAccount.balance += booking.totalPrice;
                await bankAccount.save();
            }

            booking.canceled = true;
            await booking.save();

            req.flash("success", "Booking canceled successfully. Refund processed.");
        } else {
            req.flash("error", "You can only cancel within 7 days of booking.");
        }

        res.redirect("/booking/history");
    } catch (err) {
        console.error(err);
        req.flash("error", "Error canceling the booking.");
        res.redirect("/booking/history");
    }
});





// // // // // // // GET cancel booking
// // // // // // router.get("/cancel/:bookingId", isLoggedIn, async (req, res) => {
// // // // // //     try {
// // // // // //         const { bookingId } = req.params;
// // // // // //         const booking = await Booking.findById(bookingId);

// // // // // //         if (!booking) {
// // // // // //             req.flash("error", "Booking not found.");
// // // // // //             return res.redirect("/booking/history");
// // // // // //         }

// // // // // //         if (booking.user.toString() !== req.user._id.toString()) {
// // // // // //             req.flash("error", "Unauthorized cancellation attempt.");
// // // // // //             return res.redirect("/booking/history");
// // // // // //         }

// // // // // //         if (booking.canceled) {
// // // // // //             req.flash("error", "Booking is already canceled.");
// // // // // //             return res.redirect("/booking/history");
// // // // // //         }

// // // // // //         const diffDays = moment().diff(moment(booking.bookingDate), 'days');
// // // // // //         if (diffDays <= 7) {
// // // // // //             booking.canceled = true;
// // // // // //             await booking.save();
// // // // // //             req.flash("success", "Booking canceled successfully.");
// // // // // //         } else {
// // // // // //             req.flash("error", "You can only cancel within 7 days of booking.");
// // // // // //         }

// // // // // //         res.redirect("/booking/history");
// // // // // //     } catch (err) {
// // // // // //         console.error(err);
// // // // // //         req.flash("error", "Error canceling the booking.");
// // // // // //         res.redirect("/booking/history");
// // // // // //     }
// // // // // // });

// GET booking form
router.get("/:id/book", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const selectedPackage = (req.query.package || 'silver').toLowerCase();

        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listing");
        }

        const bookings = await Booking.find({
            listing: id,
            canceled: false,
            packageType: selectedPackage
        });

        let bookedDates = [];
        for (let booking of bookings) {
            let current = moment(booking.checkInDate);
            const end = moment(booking.checkOutDate);
            while (current.isBefore(end)) { // exclude checkout date
                bookedDates.push(current.format("YYYY-MM-DD"));
                current.add(1, 'days');
            }
        }

        res.render("booking/choosePackage", {
            listing,
            bookedDates,
            selectedPackage,  // pass to template for UI highlighting
            messages: req.flash()
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Error loading booking form.");
        res.redirect("/listing");
    }
});

// POST booking form
router.post("/:id/book", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            packageType,
            name,
            phone,
            location,
            adults,
            children = 0,
            checkin,
            checkout
        } = req.body;

        const numOfAdults = parseInt(adults);
        const numOfChildren = parseInt(children);
        const packageTypeLower = packageType.toLowerCase();

        // Basic validations
        if (!['silver', 'gold', 'platinum'].includes(packageTypeLower)) {
            req.flash("error", "Invalid package type.");
            return res.redirect(`/booking/${id}/book?package=${packageTypeLower}`);
        }

        if (!/^\d{10}$/.test(phone)) {
            req.flash("error", "Phone number must be 10 digits.");
            return res.redirect(`/booking/${id}/book?package=${packageTypeLower}`);
        }

        const checkInDate = moment(checkin).startOf('day');
        const checkOutDate = moment(checkout).startOf('day');

        if (!checkInDate.isValid() || !checkOutDate.isValid()) {
            req.flash("error", "Invalid check-in or check-out date.");
            return res.redirect(`/booking/${id}/book?package=${packageTypeLower}`);
        }

        if (checkOutDate.isSameOrBefore(checkInDate)) {
            req.flash("error", "Check-out must be after check-in.");
            return res.redirect(`/booking/${id}/book?package=${packageTypeLower}`);
        }

        const stayDuration = checkOutDate.diff(checkInDate, 'days');
        if (stayDuration < 2 || stayDuration > 30) {
            req.flash("error", "Stay duration must be between 2 and 30 days.");
            return res.redirect(`/booking/${id}/book?package=${packageTypeLower}`);
        }

        const today = moment().startOf('day');
        if (checkInDate.isBefore(today) || checkOutDate.isBefore(today)) {
            req.flash("error", "Booking dates must be in the future.");
            return res.redirect(`/booking/${id}/book?package=${packageTypeLower}`);
        }

        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listing");
        }

        // Check for overlapping bookings for same package and listing
        const overlappingBooking = await Booking.findOne({
            listing: id,
            packageType: packageTypeLower,
            canceled: false,
            $or: [
                {
                    checkInDate: { $lt: checkOutDate.toDate() },
                    checkOutDate: { $gt: checkInDate.toDate() }
                }
            ]
        });

        if (overlappingBooking) {
            req.flash("error", "This package is already booked for the selected dates.");
            return res.redirect(`/booking/${id}/book?package=${packageTypeLower}`);
        }

        const adultRate = 100;
        const childRate = 50;
        const totalPrice = (numOfAdults * adultRate + numOfChildren * childRate) * stayDuration;

        const booking = new Booking({
            listing: id,
            user: req.user._id,
            packageType: packageTypeLower,
            name,
            phone,
            location,
            adults: numOfAdults,
            children: numOfChildren,
            days: stayDuration,
            totalPrice,
            checkInDate: checkInDate.toDate(),
            checkOutDate: checkOutDate.toDate(),
            bookingDate: new Date(),
            canceled: false,
            confirmed: false
        });

        // // // await booking.save();
        // // // req.flash("success", "Booking successful!");
        // // // res.redirect(`/booking/confirmation/${booking._id}`);

        await booking.save();
        // Instead of redirecting to confirmation:
        req.flash("success", "Booking created! Please complete payment.");
        res.redirect(`/booking/payment/${booking._id}`);  // NEW payment route

    } catch (err) {
        console.error(err);
        req.flash("error", "Booking failed due to a server error.");
        res.redirect(`/booking/${req.params.id}/book`);
    }
});




/// GET payment page with PIN form
router.get("/payment/:bookingId", isLoggedIn, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId).populate("listing");
        console.log("Booking in GET /payment:", booking);

        if (!booking || booking.user.toString() !== req.user._id.toString()) {
            console.log("Booking not found or unauthorized access.");
            req.flash("error", "Unauthorized or booking not found.");
            return res.redirect("/booking/history");
        }

        // ✅ Fallback: Check and create bank account if not exists
        let bankAccount = await Bank.findOne({ user: req.user._id });
        if (!bankAccount) {
            console.log("No bank account found, creating one...");
            bankAccount = await Bank.create({
                user: req.user._id,
                pin: "1234", // Optional: prompt to change later
                balance: 30000
            });
        }

        res.render("payment/pay", {
            booking,
            userBalance: bankAccount.balance
        });

    } catch (err) {
        console.error("Error in GET /payment:", err);
        req.flash("error", "Failed to load payment page.");
        res.redirect("/booking/history");
    }
});


// POST payment processing
router.post("/payment/:bookingId", isLoggedIn, async (req, res) => {
    try {
        const { pin } = req.body;
        const booking = await Booking.findById(req.params.bookingId);





        if (!booking || booking.user.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized or booking not found.");
            return res.redirect("/booking/history");
        }
        if (booking.confirmed) {
            req.flash("error", "Booking already confirmed.");
            return res.redirect(`/booking/confirmation/${booking._id}`);
        }

        // Get user's bank account
        const bankAccount = await Bank.findOne({ user: req.user._id });
        if (!bankAccount) {
            req.flash("error", "Bank account not found.");
            return res.redirect("/booking/history");
        }

        console.log("Entered PIN:", pin);
        console.log("Stored PIN:", bankAccount.pin);




        // // // Check PIN
        // // if (bankAccount.pin !== pin) {
        // //     req.flash("error", "Invalid PIN.");
        // //     return res.redirect(`/booking/payment/${booking._id}`);
        // // }


        const isPinValid = await bcrypt.compare(pin.trim(), bankAccount.pin);
        if (!isPinValid) {
            req.flash("error", "Invalid PIN.");
            return res.redirect(`/booking/payment/${booking._id}`);
        }




        // Check balance
        if (bankAccount.balance < booking.totalPrice) {
            req.flash("error", "Insufficient balance.");
            return res.redirect(`/booking/payment/${booking._id}`);
        }

        // Deduct balance and confirm booking
        bankAccount.balance -= booking.totalPrice;
        await bankAccount.save();

        booking.confirmed = true;
        await booking.save();

        req.flash("success", "Payment successful! Booking confirmed.");
        res.redirect(`/booking/confirmation/${booking._id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Payment processing failed.");
        res.redirect(`/booking/payment/${req.params.bookingId}`);
    }
});














// // // GET booking confirmation
router.get("/confirmation/:bookingId", isLoggedIn, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate("listing");

        if (!booking || booking.user.toString() !== req.user._id.toString() || booking.canceled) {
            req.flash("error", "Booking not found or unauthorized.");
            return res.redirect("/booking/history");
        }

        res.render("booking/confirmation", { booking });
    } catch (err) {
        console.error(err);
        req.flash("error", "Error loading confirmation.");
        res.redirect("/booking/history");
    }
});

// // // POST confirm booking
router.post("/confirm/:bookingId", isLoggedIn, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            req.flash("error", "Booking not found.");
            return res.redirect("/booking/history");
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized access.");
            return res.redirect("/booking/history");
        }

        if (booking.canceled) {
            req.flash("error", "Booking has been canceled.");
            return res.redirect("/booking/history");
        }

        // Mark booking as confirmed
        booking.confirmed = true;
        await booking.save();

        req.flash("success", "Booking confirmed!");
        res.redirect("/booking/history");
    } catch (err) {
        console.error(err);
        req.flash("error", "Error confirming the booking.");
        res.redirect("/booking/history");
    }
});

module.exports = router;


// http://localhost:8080/booking/confirmation/682b1bfb04314a1b0ae36d80