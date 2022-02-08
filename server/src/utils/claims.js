const { auth } = require("@enkeldigital/firebase-admin");

module.exports.setClaims = (claims) => async (uid) =>
  auth.setCustomUserClaims(uid, claims);

module.exports.setClaimsWithEmail = (claims) => async (userEmail) =>
  auth.getUserByEmail(userEmail).then(({ uid }) => setClaims(claims)(uid));
