// Load environment variables if not in production
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

console.log(process.env.ATLASDB_URL); // MongoDB connection string
console.log(process.env.SECRET);      // Secret for sessions or encryption

// Core modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// Custom modules
const ExpressError = require("./utils/ExpressError.js");
const { isLoggedIn } = require("./middleware.js");

// Models
const User = require("./models/user.js");
const Booking = require("./models/booking.js");

// Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const bookingHistoryRouter = require("./routes/bookingHistory");  // <-- Require bookingHistory router here

// Session, Flash, Passport setup
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

// Database connection
const dbUrl = process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);

main()
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log("MongoDB connection error", err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

// Express app setup
const app = express();

// View engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));


// Session store setup
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // 1 day
});

store.on("error", () => {
    console.log("Error in mongo session store");
});

// Session configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages and current user middleware
app.use((req, res, next) => {
    res.locals.currUser = req.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use("/listing", listingRouter);
app.use("/listing/:id/reviews", reviewRouter);
app.use("/", userRouter);

// <<<< Add bookingHistory route here >>>>
app.use("/booking/history", isLoggedIn, bookingHistoryRouter);
app.use("/booking", isLoggedIn, bookingRouter);

// View all bookings (for debugging or admin purpose maybe)
app.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('listing user');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Catch-all for invalid routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listing/error.ejs", { err });
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
