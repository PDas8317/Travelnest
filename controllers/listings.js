const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });





module.exports.index = async (req, res) => {
    let allListing = await Listing.find();
    res.render("listing/index.ejs", { allListing });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listing/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let showList = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        }).populate("owner");
    // console.log(showList);

    if (!showList) {
        req.flash("error", "Does not exist this listing");
        res.redirect("/listing");
    }
    res.render("listing/show.ejs", { showList });
}


module.exports.createListing = async (req, res) => {
    // let result = listingSchema.validate(req.body);
    // console.log(result);

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
        .send()

    // console.log(response.body.features[0].geometry);
    // res.send("DONE");


    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url, ">>>>>>>", filename);


    let newList = new Listing(req.body.listing);
    newList.owner = req.user._id;
    newList.image = { url, filename };
    newList.geometry = response.body.features[0].geometry;
    // console.log(newList);
    let saveListing = await newList.save();
    console.log(saveListing);

    req.flash("success", "New listing is created");
    res.redirect("/listing");
}




module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let editList = await Listing.findById(id);
    // console.log(editList);

    if (!editList) {
        req.flash("error", "Does not exist this listing");
        res.redirect("/listing");
    }

    let originalImageUrl = editList.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render("listing/edit.ejs", { editList, originalImageUrl });
}


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let editedList = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        editedList.image = { url, filename };
        await editedList.save();
    }

    req.flash("success", "Listing updated")
    res.redirect(`/listing/${id}`);
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deleteList = await Listing.findByIdAndDelete(id);
    // console.log(deleteList);

    req.flash("success", "Listing is deleted");
    res.redirect("/listing");
}