// // // // controllers users.js
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");
const bcrypt = require('bcrypt');
const Bank = require("../models/bank");


module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}



module.exports.signUp = async (req, res, next) => {
    try {
        const { username, email, password, pin, balance } = req.body;

        // Validate PIN format
        if (!/^\d{4}$/.test(pin)) {
            req.flash("error", "PIN must be exactly 4 digits.");
            return res.redirect("/signup");
        }

        // Validate balance - must be at least 30000
        const initialBalance = parseInt(balance, 10);
        if (isNaN(initialBalance) || initialBalance < 30000) {
            req.flash("error", "Initial balance must be at least ₹30,000.");
            return res.redirect("/signup");
        }

        // Create new user and register
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        // Hash the pin
        const hashedPin = await bcrypt.hash(pin, 10);

        // Create bank record with user, pin, and balance chosen by user
        await Bank.create({
            user: registeredUser._id,
            pin: hashedPin,
            balance: initialBalance
        });

        // Log the user in
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to TravelNest");
            res.redirect("/listing");
        });
    } catch (e) {
        console.error("❌ Signup error:", e);
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};



// // module.exports.signUp = async (req, res, next) => {
// //     try {
// //         const { username, email, password, pin } = req.body;

// //         // PIN validation - add this here at the very beginning
// //         if (!/^\d{4}$/.test(pin)) {
// //             req.flash("error", "PIN must be exactly 4 digits.");
// //             return res.redirect("/signup");
// //         }

// //         // Now continue with registration
// //         const newUser = new User({ email, username });
// //         const registeredUser = await User.register(newUser, password);

// //         const hashedPin = await bcrypt.hash(pin, 10);

// //         await Bank.create({
// //             user: registeredUser._id,
// //             pin: hashedPin,
// //             balance: 30000
// //         });

// //         req.login(registeredUser, (err) => {
// //             if (err) return next(err);
// //             req.flash("success", "Welcome to TravelNest");
// //             res.redirect("/listing");
// //         });
// //     } catch (e) {
// //         console.error("❌ Signup error:", e);
// //         req.flash("error", e.message);
// //         res.redirect("/signup");
// //     }
// // };




// module.exports.signUp = async (req, res) => {
//     try {
//         let { username, email, password } = req.body;
//         const newUser = new User({ email, username });
//         const registeredUser = await User.register(newUser, password);
//         console.log("Registered user : ", registeredUser);


//         // Create a virtual bank account for the new user
//         await Bank.create({
//             user: registeredUser._id,
//             pin: '1234',         // Default PIN, you can change this or ask user to set
//             balance: 30000       // Initial balance ₹30,000
//         });



//         req.login(registeredUser, (err) => {
//             if (err) {
//                 return next(err);
//             }
//             req.flash("success", "Welcome to wanderDest");
//             res.redirect("/listing");
//         })

//     } catch (e) {
//         req.flash("error", e.message);
//         res.redirect("/signup");
//     }
// }



module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs")
}


module.exports.login = async (req, res) => {
    req.flash("success", "Welcome ! you're logged in");

    let redirectUrl = res.locals.redirectUrl || "/listing";
    console.log(res.locals.redirectUrl);

    res.redirect(redirectUrl);
    // res.redirect("/listing");
}


module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Succesfully logged out!!");
        res.redirect("/listing");
    })
}