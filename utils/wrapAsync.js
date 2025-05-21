module.exports = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    }
}



// // utils/wrapAsync.js
// module.exports = function (func) {
//     return function (req, res, next) {
//         func(req, res, next).catch(next);
//     };
// };
