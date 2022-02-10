const { auth } = require("@enkeldigital/firebase-admin");

// Curried setClaims function so that for e.g. claims can be set in bulk
module.exports.setClaims = (claims) => async (uid) =>
  auth.setCustomUserClaims(uid, claims);

// Alternative setClaims function that provides optional currying
// const setClaims = (claims, uid) =>
//   uid
//     ? auth.setCustomUserClaims(uid, claims)
//     : async (uid) => auth.setCustomUserClaims(uid, claims);

module.exports.setClaimsWithEmail = (claims) => async (userEmail) =>
  auth.getUserByEmail(userEmail).then(({ uid }) => setClaims(claims)(uid));
