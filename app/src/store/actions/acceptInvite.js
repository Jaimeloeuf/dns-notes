import { getAuthHeader, auth } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { errorHandlingWrapper } from "../utils.js";

/**
 * Vuex action to accept an org invite.
 * Only used by new users thus lazily loaded.
 */
export default errorHandlingWrapper(async function acceptInvite(
  { commit, dispatch },
  invitationID
) {
  const res = await oof
    .POST(`/user/invite/accept/${invitationID}`)
    .header(await getAuthHeader())
    .runJSON();

  if (!res.ok) throw new Error(res.error);

  // Refresh JWT to get new token with the claims set on it by the previous API call
  await auth.currentUser.getIdToken(true);

  // Get orgID, email and admin status from the JWT to set it into store
  const {
    claims: { org, email, admin },
  } = await auth.currentUser.getIdTokenResult();
  commit("setter", ["org", org]);
  commit("setter", ["email", email]);
  commit("setter", ["admin", admin]);

  // Load all notes now that user belongs to an org
  await dispatch("loadAllNotes");
});
