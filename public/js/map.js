
// let mapToken = mapToken;
// console.log(mapToken);
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: [77.209, 28.6139], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

console.log(showList.geometry.coordinates);
// const marker1 = new mapboxgl.Marker()
//     .setLngLat()
//     .addTo(map);