// // // // // // // // // // // // // // // // // const express = require("express");
// // // // // // // // // // // // // // // // // const router = express.Router();

// // // // // // // // // // // // // // // // // const Listing = require("../models/listing.js");
// // // // // // // // // // // // // // // // // const wrapAsync = require("../utils/wrapAsync.js");
// // // // // // // // // // // // // // // // // const ExpressError = require("../utils/ExpressError.js");
// // // // // // // // // // // // // // // // // const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// // // // // // // // // // // // // // // // // const listingController = require("../controllers/listings.js");

// // // // // // // // // // // // // // // // // const multer = require('multer')
// // // // // // // // // // // // // // // // // const { storage } = require("../cloudConfig.js");
// // // // // // // // // // // // // // // // // const upload = multer({ storage })





// // // // // // // // // // // // // // // // // // // // // Using router.route
// // // // // // // // // // // // // // // // // router.route("/")
// // // // // // // // // // // // // // // // //     .get(wrapAsync(listingController.index))
// // // // // // // // // // // // // // // // //     .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing)
// // // // // // // // // // // // // // // // //     );


// // // // // // // // // // // // // // // // // new route
// // // // // // // // // // // // // // // // // router.get("/new", isLoggedIn, listingController.renderNewForm);



// // // // // // // // // // // // // // // // // router.route("/:id")
// // // // // // // // // // // // // // // // //     .get(wrapAsync(listingController.showListing))
// // // // // // // // // // // // // // // // //     .patch(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
// // // // // // // // // // // // // // // // //     .delete(isLoggedIn, isOwner,
// // // // // // // // // // // // // // // // //         wrapAsync(listingController.deleteListing)
// // // // // // // // // // // // // // // // //     );






// // // // // // // // // // // // // // // // // index
// // // // // // // // // // // // // // // // // router.get("/", wrapAsync(listingController.index));

// // // // // // // // // // // // // // // // // new route
// // // // // // // // // // // // // // // // // router.get("/new", isLoggedIn, listingController.renderNewForm);


// // // // // // // // // // // // // // // // // // // // // show route
// // // // // // // // // // // // // // // // // router.get("/:id", wrapAsync(listingController.showListing));


// // // // // // // // // // // // // // // // // // // // Create route
// // // // // // // // // // // // // // // // // router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

// // // // // // // // // // // // // // // // // // // // edit route
// // // // // // // // // // // // // // // // // router.get("/:id/edit", isLoggedIn, isOwner,
// // // // // // // // // // // // // // // // //     wrapAsync(listingController.renderEditForm));

// // // // // // // // // // // // // // // // // // // // // patch route
// // // // // // // // // // // // // // // // // router.patch("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// // // // // // // // // // // // // // // // // // // // // destroy route
// // // // // // // // // // // // // // // // // router.delete("/:id", isLoggedIn, isOwner,
// // // // // // // // // // // // // // // // //     wrapAsync(listingController.deleteListing));



// // // // // // // // // // // // // // // // // module.exports = router;





/*new code*/












// // // // // // // // // // another code
// // // // // // // // // const express = require("express");
// // // // // // // // // const router = express.Router();

// // // // // // // // // const listingController = require("../controllers/listings.js");
// // // // // // // // // const wrapAsync = require("../utils/wrapAsync.js");
// // // // // // // // // const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// // // // // // // // // router.route("/")
// // // // // // // // //     .get(wrapAsync(listingController.index))
// // // // // // // // //     .post(isLoggedIn, wrapAsync(listingController.createListing));

// // // // // // // // // router.get("/new", isLoggedIn, listingController.renderNewForm);

// // // // // // // // // router.route("/:id")
// // // // // // // // //     .get(wrapAsync(listingController.showListing))
// // // // // // // // //     .patch(isLoggedIn, isOwner, wrapAsync(listingController.updateListing))
// // // // // // // // //     .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// // // // // // // // // router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// // // // // // // // // module.exports = router;



















// // // // // routes/listing.js
// // // // const express = require("express");
// // // // const router = express.Router();

// // // // // Sample data (You might replace this with a database query)
// // // // const showList = [
// // // //     { name: 'Package 1', price: 100 },
// // // //     { name: 'Package 2', price: 200 },
// // // //     { name: 'Package 3', price: 300 },
// // // // ];

// // // // // Route to display packages
// // // // router.get("/show", (req, res) => {
// // // //     console.log("showList:", showList); // Log showList for debugging
// // // //     res.render("listing/show", { showList }); // Ensure 'listing/show' is correct
// // // // });

// // // // module.exports = router;





























// // // // // // // in routes listing.js
const express = require("express");
const router = express.Router();



// Import the controller functions
const listingController = require("../controllers/listings.js");

// Utility functions
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


// Multer for Cloudinary storage
const multer = require('multer');
const { storage } = require('../cloudConfig');  // Import Cloudinary storage config
const upload = multer({ storage });  // Use Cloudinary storage



// Route to display all listings
router.get("/", wrapAsync(listingController.index));


// Route to display the form for creating a new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);

// routes/listing.js
router.post(
    "/",
    isLoggedIn,
    upload.single('image'), // ⬅️ NOT 'listing[image]'
    validateListing,
    wrapAsync(listingController.createListing)
);


// Route to display the form for editing an existing listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Route to show a specific listing based on its ID
router.get("/:id", wrapAsync(listingController.showListing));


// Route to update an existing listing
router.patch("/:id", isLoggedIn, isOwner, validateListing, upload.single('image'), wrapAsync(listingController.updateListing));

// Route to delete a listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;


