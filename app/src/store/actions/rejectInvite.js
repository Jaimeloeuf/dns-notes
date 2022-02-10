import { getAuthHeader, auth } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { failed } from "../utils.js";

/**
 * Vuex action to reject an org invite.
 * Only used by new users thus lazily loaded.
 */
export default async function rejectInvite({ commit, dispatch }, invitationID) {
  try {
    commit("loading", true);

    const res = await oof
      .POST(`/user/invite/reject/${invitationID}`)
      .header(await getAuthHeader())
      .runJSON();

    if (!res.ok) return failed(res.error, dispatch, "rejectInvite");
  } catch (error) {
    // For errors that cause API call itself to throw
    console.error(error);
    return failed(error.message, dispatch, "rejectInvite");
  } finally {
    commit("loading", false);
  }
}
