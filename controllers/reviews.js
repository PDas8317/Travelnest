const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");




module.exports.createReview = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    console.log(newReview);

    await newReview.save();
    await listing.save();


    req.flash("success", "New review is created");

    res.redirect(`/listing/${id}`);
}

module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;

    //mongoose pull method
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);


    // req.flash("success", "Review is deleted");

    res.redirect(`/listing/${id}`)
}