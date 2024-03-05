const mongoose = require('mongoose');
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
    .then(() => {
        console.log("Connected");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/WanderDest');

}


const initDB = async () => {
    await Listing.deleteMany({});

    initData.data = initData.data.map((obj) => (
        { ...obj, owner: '65e48115966e16fbdf094288' }
    ))
    await Listing.insertMany(initData.data);
    console.log("Initialized");
}
initDB();