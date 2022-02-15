import { getAuthHeader } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { errorHandlingWrapper } from "../utils.js";

/**
 * Vuex action to reject an org invite.
 * Only used by new users thus lazily loaded.
 */
export default errorHandlingWrapper(async function rejectInvite(
  _,
  invitationID
) {
  const res = await oof
    .POST(`/user/invite/reject/${invitationID}`)
    .header(await getAuthHeader())
    .runJSON();

  if (!res.ok) throw new Error(res.error);
});
