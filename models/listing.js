const mongoose = require('mongoose');
const Review = require("./review.js");


const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        // type: String,
        // default: "https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=612x612&w=0&k=20&c=A63koPKaCyIwQWOTFBRWXj_PwCrR4cEoOw2S9Q7yVl8=",
        // set: (v) =>
        //     v === "" ? "https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=612x612&w=0&k=20&c=A63koPKaCyIwQWOTFBRWXj_PwCrR4cEoOw2S9Q7yVl8="
        //         : v,

        url: String,
        filename: String,

    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
        category: {
            type: String,
            enum: ["mountains", "arctic"]
        }
    }


})


// // post mongoose middleware to handle deletion // //
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } })
    }
})



const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;