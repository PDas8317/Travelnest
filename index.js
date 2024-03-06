if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
// const Review = require("./models/review.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

// const { reviewSchema } = require("./schema.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connected");
    })
    .catch((err) => {
        console.log("error occurred");
    })


async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/WanderDest");
    // await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);



const store = MongoStore.create({
    mongoUrl: "mongodb://127.0.0.1:27017/WanderDest",
    // mongoUrl: dbUrl,

    crypto: {
        // secret: process.env.SECRET,
        secret: "supersecret",
    },
    touchAfter: 24 * 3600,
})

store.on("error", () => {
    console.log("Error in mongo session store");
})

const sessionOptions = {
    store,
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }

};


// app.get("/", (req, res) => {
//     res.send("Welcome to Wanderdest page :)");
// })



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// //validation for listing schema
// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(403, errMsg);
//     } else {
//         next();
//     }
// }


// //validation for review schema
// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(403, errMsg);
//     } else {
//         next();
//     }
// }




// //index
// app.get("/listing", wrapAsync(async (req, res) => {
//     let allListing = await Listing.find();
//     res.render("listing/index.ejs", { allListing });
// }))

// // new route
// app.get("/listing/new", (req, res) => {
//     res.render("listing/new.ejs");
// })


// // show route
// app.get("/listing/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let showList = await Listing.findById(id).populate("reviews");
//     // console.log(showList);

//     if (!showList) {
//         res.redirect("/listing");
//     }
//     res.render("listing/show.ejs", { showList });
// }))


// // Create route
// app.post("/listing", validateListing, wrapAsync(async (req, res) => {
//     // let result = listingSchema.validate(req.body);
//     // console.log(result);

//     let newList = new Listing(req.body.listing);
//     console.log(newList);
//     await newList.save();
//     res.redirect("/listing");
// }))

// //edit route
// app.get("/listing/:id/edit",
//     wrapAsync(async (req, res) => {
//         let { id } = req.params;
//         let editList = await Listing.findById(id);
//         // console.log(editList);

//         if (!editList) {
//             res.redirect("/listing");
//         }
//         res.render("listing/edit.ejs", { editList });
//     }))

// //patch route
// app.patch("/listing/:id", validateListing, wrapAsync(async (req, res) => {
//     let { id } = req.params;


//     let editedList = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//     res.redirect(`/listing/${id}`);
// }))

// // destroy route
// app.delete("/listing/:id",
//     wrapAsync(async (req, res) => {
//         let { id } = req.params;
//         let deleteList = await Listing.findByIdAndDelete(id);
//         // console.log(deleteList);

//         res.redirect("/listing");
//     }))



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "random@gmail.com",
        username: "random"
    })

    let registeredUser = await User.register(fakeUser, "random");
    res.send(registeredUser);
})






app.use("/listing", listingRouter);
app.use("/listing/:id/reviews", reviewRouter);
app.use("/", userRouter);






// //Reviews
// app.post("/listing/:id/reviews", validateReview, wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     console.log(newReview);
//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();


//     // req.flash("success", "New review is created");

//     res.redirect(`/listing/${id}`);
// }));


// // review destroy route
// app.delete("/listing/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;

//     //mongoose pull method
//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
//     await Review.findByIdAndDelete(reviewId);


//     // req.flash("success", "Review is deleted");

//     res.redirect(`/listing/${id}`)
// }));





//error handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found :("));
})


app.use((err, req, res, next) => {
    let { statusCode = 494, message = "Error occured" } = err;
    // res.send("Something went wrong!");
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listing/error.ejs", { err });
})




app.listen(8080, () => {
    console.log("Listening");
})