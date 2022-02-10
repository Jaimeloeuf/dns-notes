const { auth } = require("@enkeldigital/firebase-admin");

// Curried setClaims function so that for e.g. claims can be set in bulk
const setClaims = (claims) => async (uid) =>
  auth.setCustomUserClaims(uid, claims);

// Alternative setClaims function that provides optional currying
// const setClaims = (claims, uid) =>
//   uid
//     ? auth.setCustomUserClaims(uid, claims)
//     : async (uid) => auth.setCustomUserClaims(uid, claims);

const setClaimsWithEmail = (claims) => async (userEmail) =>
  auth.getUserByEmail(userEmail).then(({ uid }) => setClaims(claims)(uid));

// Exports have to be seperate as functions must be named, as for e.g. setClaimsWithEmail uses the setClaims function
module.exports.setClaims = setClaims;
module.exports.setClaimsWithEmail = setClaimsWithEmail;
