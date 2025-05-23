const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
    // No balance or pin here
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
