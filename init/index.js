// // // // in init indexedDB={.js}
// const mongoose = require('mongoose');
// const initData = require("./data.js"); // Importing data.js
// const Listing = require("../models/listing.js");

// async function main() {
//     await mongoose.connect('mongodb+srv://PDas:x2eBZ7HqiJNKh4sS@cluster0.uaiyipc.mongodb.net/TravelNest?retryWrites=true&w=majority&appName=Cluster0');
//     console.log("MongoDB connected!!!!!!!!!!");

//     await initDB();
// }

// const initDB = async () => {
//     await Listing.deleteMany({});  // Optional: Clear existing data

//     const modifiedData = initData.data.map((obj) => {
//         if (!obj.geometry) {
//             obj.geometry = { type: 'Point', coordinates: [0, 0], category: 'mountains' };
//         }
//         return {
//             ...obj,
//             owner: '65e48115966e16fbdf094288'  // Example: owner field added
//         };
//     });

//     await Listing.insertMany(modifiedData);
//     console.log('Data inserted into MongoDB');
//     const listings = await Listing.find({});
//     console.log(listings);
// };

// main().catch(err => console.log(err));




// seedAtlas.js or initDB.js

const mongoose = require('mongoose');
const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {
    try {
        await mongoose.connect('mongodb+srv://PDas:x2eBZ7HqiJNKh4sS@cluster0.uaiyipc.mongodb.net/TravelNest?retryWrites=true&w=majority&appName=Cluster0');
        console.log("✅ MongoDB Atlas connected!");

        await initDB();
        console.log("🌱 Seeding completed!");
    } catch (err) {
        console.error("❌ Error connecting or seeding:", err);
    } finally {
        mongoose.connection.close(); // Always close the DB connection
    }
}

const initDB = async () => {
    await Listing.deleteMany({}); // Optional: clears old listings

    const modifiedData = initData.data.map((obj) => {
        if (!obj.geometry) {
            obj.geometry = {
                type: 'Point',
                coordinates: [0, 0],
                category: 'mountains'
            };
        }
        return {
            ...obj,
            owner: '65e48115966e16fbdf094288' // Ensure this ID exists in your User model
        };
    });

    await Listing.insertMany(modifiedData);
    console.log(`📦 Inserted ${modifiedData.length} listings.`);
};

main();
