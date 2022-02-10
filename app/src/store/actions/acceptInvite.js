import { getAuthHeader, auth } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { failed } from "../utils.js";

/**
 * Vuex action to accept an org invite.
 * Only used by new users thus lazily loaded.
 */
export default async function acceptInvite({ commit, dispatch }, invitationID) {
  try {
    commit("loading", true);

    const res = await oof
      .POST(`/user/invite/accept/${invitationID}`)
      .header(await getAuthHeader())
      .runJSON();

    if (!res.ok) return failed(res.error, dispatch, "acceptInvite");

    // Refresh JWT to get new token with the claims set on it by the previous API call
    await auth.currentUser.getIdToken(true);

    // Get orgID, email and admin status from the JWT to set it into store
    const {
      claims: { org, email, admin },
    } = await auth.currentUser.getIdTokenResult();
    commit("setter", ["org", org]);
    commit("setter", ["email", email]);
    commit("setter", ["admin", admin]);

    // Reload to call loadAllNotes
    await dispatch("loadAllNotes");
  } catch (error) {
    // For errors that cause API call itself to throw
    console.error(error);
    return failed(error.message, dispatch, "acceptInvite");
  } finally {
    commit("loading", false);
  }
}
