
// // // let mapToken = mapToken;
// mapboxgl.accessToken = mapToken;
// // console.log(mapToken);

// const map = new mapboxgl.Map({
//     container: 'map', // container ID
//     center: co.geometry.coordinates, // starting position [lng, lat]
//     zoom: 9 // starting zoom
// });

// console.log(co.geometry.coordinates);
// console.log(co.location);
// const marker1 = new mapboxgl.Marker({ color: "red" })
//     .setLngLat(co.geometry.coordinates)
//     .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
//         `<h4>${co.location}</h4>`
//     ))
//     .addTo(map);


// // mapboxgl.accessToken = mapToken;

// // const map = new mapboxgl.Map({
// //     container: 'map', // container ID
// //     style: 'mapbox://styles/mapbox/streets-v12',
// //     center: listing.geometry.coordinates, // starting position [lng, lat]
// //     zoom: 9 // starting zoom
// // });

// // const marker = new mapboxgl.Marker({ color: "red" })
// //     .setLngLat(listing.geometry.coordinates)
// //     .setPopup(new mapboxgl.Popup({ offset: 25 })
// //         .setHTML(`<h4>${showList.title}</h4><p>Exact location will be provided after booking</p>`))
// //         .addTo(map);









mapboxgl.accessToken = mapToken;

const coords = co.geometry.coordinates;
const category = co.geometry.category;

// Set custom marker color by category
const markerColor = category === "mountains" ? "#4CAF50" : "#00BCD4";

// Create the map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: coords,
    zoom: 8
});

// Add marker with popup
new mapboxgl.Marker({ color: markerColor })
    .setLngLat(coords)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h6>${co.title}</h6><p>${co.location}, ${co.country}</p>`
        )
    )
    .addTo(map);

// Add map controls
map.addControl(new mapboxgl.NavigationControl());
