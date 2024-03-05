const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })





// //Using router.route
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing)
    );


// new route
router.get("/new", isLoggedIn, listingController.renderNewForm);



router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .patch(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner,
        wrapAsync(listingController.deleteListing)
    );






//index
// router.get("/", wrapAsync(listingController.index));

// // new route
// router.get("/new", isLoggedIn, listingController.renderNewForm);


// show route
// router.get("/:id", wrapAsync(listingController.showListing));


// Create route
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner,
    wrapAsync(listingController.renderEditForm));

//patch route
// router.patch("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// destroy route
// router.delete("/:id", isLoggedIn, isOwner,
//     wrapAsync(listingController.deleteListing));



module.exports = router;
