import { auth } from "@enkeldigital/firebase-admin";

type ClaimsObject = {
  [key: string]: number | string | boolean;
};

// Curried setClaims function so that for e.g. claims can be set in bulk
export const setClaims = (claims: ClaimsObject) => async (uid: string) =>
  auth.setCustomUserClaims(uid, claims);

// Alternative setClaims function that provides optional currying
// const setClaims = (claims, uid) =>
//   uid
//     ? auth.setCustomUserClaims(uid, claims)
//     : async (uid) => auth.setCustomUserClaims(uid, claims);

export const setClaimsWithEmail =
  (claims: ClaimsObject) => async (userEmail: string) =>
    auth
      .getUserByEmail(userEmail)
      .then(({ uid }: { uid: string }) => setClaims(claims)(uid));
