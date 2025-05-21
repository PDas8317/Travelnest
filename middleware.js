// // // // // // // Another code
const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema, listingSchema } = require("./schema.js");

// Middleware to check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    console.log("User authenticated:", req.isAuthenticated());  // Debugging line
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;  // Save the URL they wanted to visit
        req.flash("error", "Please Login First");
        return res.redirect("/login");
    }
    next();  // Continue to the next middleware or route
};

// Middleware to check if the user is an admin
module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next(); // If the user is an admin, proceed to the next route or middleware
    }
    req.flash("error", "You do not have permission to view this page.");
    return res.redirect("/");  // Or redirect to an appropriate page, such as homepage
};

// Middleware to save the redirect URL (if user was redirected)
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;  // Make it available in views
    }
    next();
};

// Middleware to check if the user is the owner of a listing
module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);  // Fetch the listing from DB

        // Debugging line to check owner and user data
        console.log("Current User:", res.locals.currUser);

        console.log("Listing Owner ID:", listing.owner);
        console.log("Current User ID:", res.locals.currUser._id);

        // If the user is not the owner, deny access
        if (!listing.owner.equals(res.locals.currUser._id)) {
            req.flash("error", "Access denied");
            return res.redirect(`/listing/${id}`);
        }

        next();  // Continue to the next middleware or route
    } catch (error) {
        next(error);  // Handle any error that occurs while fetching the listing
    }
};


// Middleware to check if the user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);  // Fetch the review from DB

        // If the review doesn't exist or the user is not the author, deny access
        if (!review || !review.author.equals(req.user._id)) {
            req.flash("error", "Access denied to delete");
            return res.redirect(`/listing/${id}`);
        }
        next();  // Continue to the next middleware or route
    } catch (error) {
        next(error);  // Handle any error that occurs while fetching the review
    }
};

// Middleware to validate the listing data
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        req.flash("error", errMsg);
        return res.redirect(`/listing/${req.params.id}/edit`);
    }
    next();  // Continue if no validation errors
};


// Middleware to validate the review data
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);  // Validate the review data

    // If there are validation errors, throw an ExpressError with the details
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(403, errMsg);  // Error with status code 403 (Forbidden)
    }
    next();  // Continue to the next middleware or route
};


// // // // // // // // // // // // // // // // // //new code
// // // // // // // // // // // const Listing = require("./models/listing");
// // // // // // // // // // // const Review = require("./models/review");
// // // // // // // // // // // const ExpressError = require("./utils/ExpressError.js");
// // // // // // // // // // // const { reviewSchema, listingSchema } = require("./schema.js");

// // // // // // // // // // // // Middleware to check if the user is logged in
// // // // // // // // // // // module.exports.isLoggedIn = (req, res, next) => {
// // // // // // // // // // //     console.log("User authenticated:", req.isAuthenticated());  // Debugging line
// // // // // // // // // // //     if (!req.isAuthenticated()) {
// // // // // // // // // // //         req.session.redirectUrl = req.originalUrl;  // Save the URL they wanted to visit
// // // // // // // // // // //         req.flash("error", "Please Login First");
// // // // // // // // // // //         return res.redirect("/login");
// // // // // // // // // // //     }
// // // // // // // // // // //     next();  // Continue to the next middleware or route
// // // // // // // // // // // };

// // // // // // // // // // // // Middleware to check if the user is an admin
// // // // // // // // // // // module.exports.isAdmin = (req, res, next) => {
// // // // // // // // // // //     if (req.user && req.user.role === 'admin') {
// // // // // // // // // // //         return next(); // If the user is an admin, proceed to the next route or middleware
// // // // // // // // // // //     }
// // // // // // // // // // //     req.flash("error", "You do not have permission to view this page.");
// // // // // // // // // // //     return res.redirect("/");  // Or redirect to an appropriate page, such as homepage
// // // // // // // // // // // };

// // // // // // // // // // // // Middleware to save the redirect URL (if user was redirected)
// // // // // // // // // // // module.exports.saveRedirectUrl = (req, res, next) => {
// // // // // // // // // // //     if (req.session.redirectUrl) {
// // // // // // // // // // //         res.locals.redirectUrl = req.session.redirectUrl;  // Make it available in views
// // // // // // // // // // //     }
// // // // // // // // // // //     next();
// // // // // // // // // // // };

// // // // // // // // // // // // Middleware to check if the user is the owner of a listing
// // // // // // // // // // // module.exports.isOwner = async (req, res, next) => {
// // // // // // // // // // //     try {
// // // // // // // // // // //         const { id } = req.params;
// // // // // // // // // // //         const listing = await Listing.findById(id);  // Fetch the listing from DB

// // // // // // // // // // //         // If the user is not the owner, deny access
// // // // // // // // // // //         if (!listing.owner.equals(res.locals.currUser._id)) {
// // // // // // // // // // //             req.flash("error", "Access denied");
// // // // // // // // // // //             return res.redirect(`/listing/${id}`);
// // // // // // // // // // //         }
// // // // // // // // // // //         next();  // Continue to the next middleware or route
// // // // // // // // // // //     } catch (error) {
// // // // // // // // // // //         next(error);  // Handle any error that occurs while fetching the listing
// // // // // // // // // // //     }
// // // // // // // // // // // };

// // // // // // // // // // // // Middleware to check if the user is the author of a review
// // // // // // // // // // // module.exports.isReviewAuthor = async (req, res, next) => {
// // // // // // // // // // //     try {
// // // // // // // // // // //         const { id, reviewId } = req.params;
// // // // // // // // // // //         const review = await Review.findById(reviewId);  // Fetch the review from DB

// // // // // // // // // // //         // If the user is not the author, deny access
// // // // // // // // // // //         if (!review.author.equals(res.locals.currUser._id)) {
// // // // // // // // // // //             req.flash("error", "Access denied to delete");
// // // // // // // // // // //             return res.redirect(`/listing/${id}`);
// // // // // // // // // // //         }
// // // // // // // // // // //         next();  // Continue to the next middleware or route
// // // // // // // // // // //     } catch (error) {
// // // // // // // // // // //         next(error);  // Handle any error that occurs while fetching the review
// // // // // // // // // // //     }
// // // // // // // // // // // };

// // // // // // // // // // // // Middleware to validate the listing data
// // // // // // // // // // // module.exports.validateListing = (req, res, next) => {
// // // // // // // // // // //     const { error } = listingSchema.validate(req.body);  // Validate the listing data

// // // // // // // // // // //     // If there are validation errors, throw an ExpressError with the details
// // // // // // // // // // //     if (error) {
// // // // // // // // // // //         const errMsg = error.details.map((el) => el.message).join(", ");
// // // // // // // // // // //         throw new ExpressError(403, errMsg);  // Error with status code 403 (Forbidden)
// // // // // // // // // // //     }
// // // // // // // // // // //     next();  // Continue to the next middleware or route
// // // // // // // // // // // };

// // // // // // // // // // // // Middleware to validate the review data
// // // // // // // // // // // module.exports.validateReview = (req, res, next) => {
// // // // // // // // // // //     const { error } = reviewSchema.validate(req.body);  // Validate the review data

// // // // // // // // // // //     // If there are validation errors, throw an ExpressError with the details
// // // // // // // // // // //     if (error) {
// // // // // // // // // // //         const errMsg = error.details.map((el) => el.message).join(", ");
// // // // // // // // // // //         throw new ExpressError(403, errMsg);  // Error with status code 403 (Forbidden)
// // // // // // // // // // //     }
// // // // // // // // // // //     next();  // Continue to the next middleware or route
// // // // // // // // // // // };
