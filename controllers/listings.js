











// // // controllers listing.js
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

// Fetch all listings
module.exports.index = async (req, res) => {
    try {
        let allListing = await Listing.find();
        // console.log("Fetched Listings: ", allListing);
        res.render("listing/index", { allListing });
    } catch (e) {
        req.flash("error", "Failed to fetch listings.");
        res.redirect("/");
    }
};




module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    // Add this log to check the value of the id
    // console.log("Listing ID: ", id);  // This will log the ID parameter from the URL

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }

    res.render("listing/show", { showList: listing });
};



// Render the new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listing/new");
};

// // // // // // // // // // // // // Create a new listing
// // // // // // // // // // module.exports.createListing = async (req, res, next) => {
// // // // // // // // // //     try {
// // // // // // // // // //         console.log("Authenticated user:", req.user); // Log the authenticated user

// // // // // // // // // //         if (!req.user || !req.user._id) {
// // // // // // // // // //             req.flash("error", "You must be logged in to create a listing");
// // // // // // // // // //             return res.redirect("/login");
// // // // // // // // // //         }

// // // // // // // // // //         // Log form data
// // // // // // // // // //         console.log("Form Body:", req.body);

// // // // // // // // // //         const newListing = new Listing(req.body.listing);

// // // // // // // // // //         // Ensure owner is set correctly
// // // // // // // // // //         if (req.user && req.user._id) {
// // // // // // // // // //             newListing.owner = req.user._id;
// // // // // // // // // //         } else {
// // // // // // // // // //             console.log("Error: User is not authenticated.");
// // // // // // // // // //             req.flash("error", "User not authenticated");
// // // // // // // // // //             return res.redirect("/login");
// // // // // // // // // //         }

// // // // // // // // // //         // If there's an uploaded file, save it to Cloudinary
// // // // // // // // // //         if (req.file) {
// // // // // // // // // //             newListing.image = {
// // // // // // // // // //                 url: req.file.path,
// // // // // // // // // //                 filename: req.file.filename,
// // // // // // // // // //             };
// // // // // // // // // //         }

// // // // // // // // // //         console.log("New Listing Before Save: ", newListing); // Check if owner is set

// // // // // // // // // //         await newListing.save(); // Save the listing

// // // // // // // // // //         req.flash("success", "New listing created!");
// // // // // // // // // //         res.redirect(`/listing/${newListing._id}`);
// // // // // // // // // //     } catch (e) {
// // // // // // // // // //         next(e);
// // // // // // // // // //     }
// // // // // // // // // // };


module.exports.createListing = async (req, res, next) => {
    try {
        console.log("Authenticated user:", req.user); // Log the authenticated user

        if (!req.user || !req.user._id) {
            req.flash("error", "You must be logged in to create a listing");
            return res.redirect("/login");
        }

        console.log("Form Body:", req.body);

        const newListing = new Listing(req.body.listing);

        // Set owner
        newListing.owner = req.user._id;



        // Handle uploaded image if any
        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename,
            };
        }

        console.log("New Listing Before Save: ", newListing);

        await newListing.save();

        req.flash("success", "New listing created!");
        res.redirect(`/listing/${newListing._id}`);
    } catch (e) {
        next(e);
    }
};




// // // // module.exports.createListing = async (req, res, next) => {
// // // //     try {
// // // //         const newListing = new Listing(req.body.listing);
// // // //         newListing.owner = req.user._id;  // Assuming you're using user authentication
// // // //         await newListing.save();

// // // //         req.flash("success", "New listing created!");
// // // //         res.redirect(`/listing/${newListing._id}`);  // Correct redirect after saving the listing
// // // //     } catch (e) {
// // // //         next(e);
// // // //     }
// // // // };

// Render the edit form for a specific listing
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    console.log("✅ HIT EDIT ROUTE:", req.params.id);
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            console.log("❌ Listing not found.");
            req.flash("error", "Listing not found.");
            return res.redirect("/listing");
        }
        console.log("✅ Rendering edit form...");
        res.render("listing/edit", { listing }); // ✅ make sure it's called 'listing' here
    } catch (e) {
        console.log("❌ Error in renderEditForm:", e);
        req.flash("error", "Error fetching listing to edit.");
        // res.redirect("/listing");
        res.redirect("/");

    }
};


// // // In your controller where you're handling the POST request for editing
// // module.exports.updateListing = async (req, res) => {
// //     const { id } = req.params;
// //     const updatedData = req.body.listing;

// //     if (!updatedData) {
// //         req.flash("error", "'listing' data missing in request.");
// //         return res.redirect(`/listing/${id}/edit`);
// //     }

// //     try {
// //         const listing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });
// //         req.flash("success", "Listing updated successfully.");
// //         res.redirect(`/listing/${listing._id}`);
// //     } catch (e) {
// //         req.flash("error", "Update failed.");
// //         res.redirect(`/listing/${id}/edit`);
// //     }
// // };
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body.listing;  // Now accessing data under the listing object
    console.log("Body : ", req.body);  // To debug the form data

    if (!updatedData) {
        req.flash("error", "'listing' data missing in request.");
        return res.redirect(`/listing/${id}/edit`);
    }

    try {
        const listing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });
        req.flash("success", "Listing updated successfully.");
        res.redirect(`/listing/${listing._id}`);
    } catch (e) {
        req.flash("error", "Update failed.");
        res.redirect(`/listing/${id}/edit`);
    }
};





// Delete a listing
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listing");
        }

        // Delete the listing from the database
        await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing deleted!");
        res.redirect("/listing");
    } catch (e) {
        req.flash("error", "Failed to delete the listing.");
        res.redirect("/listing");
    }
};
