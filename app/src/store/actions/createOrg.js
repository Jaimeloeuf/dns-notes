import { getAuthHeader, auth } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { errorHandlingWrapper } from "../utils.js";

/**
 * Vuex action to create an organization
 * Only used by new users thus lazily loaded.
 */
export default errorHandlingWrapper(async function createOrg({ commit }, org) {
  const res = await oof
    .POST("/org/create")
    .header(await getAuthHeader())
    .data(org)
    .runJSON();

  if (!res.ok) throw new Error(res.error);

  // @todo Process payment

  // Refresh JWT to get new token with the claims set on it by the previous API call
  await auth.currentUser.getIdToken(true);

  // Get orgID, email and admin status from the JWT to set it into store
  const {
    claims: { org, email, admin },
  } = await auth.currentUser.getIdTokenResult();
  commit("setter", ["org", org]);
  commit("setter", ["email", email]);
  commit("setter", ["admin", admin]);
});
