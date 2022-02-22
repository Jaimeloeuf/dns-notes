import { getAuthHeader, auth } from "../../firebase.js";
import { oof } from "simpler-fetch";

import router from "../../router.js";

import { errorHandlingWrapper } from "../utils.js";

/**
 * Vuex action to leave their current organization
 */
export default errorHandlingWrapper(async function leaveOrg({ state, commit }) {
  const res = await oof
    .POST(`/user/leave/${state.org}`)
    .header(await getAuthHeader())
    .runJSON();

  if (!res.ok) throw new Error(res.error);

  // Since user left the org, reset the orgID, admin status and everything else in the store
  // Clear everything in vuex state by resetting it to its default state
  // Clearing this will also trigger plugin to clear all persisted state
  commit("reset");

  // Refresh JWT to get new token with the claims removed by the previous API call
  await auth.currentUser.getIdToken(true);

  // Redirect user to NewUser view as they are now considered a new user once again
  router.push({ name: "new-user" });
});
