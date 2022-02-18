import { getAuthHeader } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { errorHandlingWrapper } from "../utils.js";

/**
 * Vuex action to check for org invites.
 * Only used by new users thus lazily loaded.
 */
export default errorHandlingWrapper(async function checkForInvites(_) {
  const res = await oof
    .GET("/user/invite/check/pending")
    .header(await getAuthHeader())
    .runJSON();

  if (!res.ok)
    if (res.status === 404) console.log("checkForInvites action: No invites");
    else throw new Error(res.error);

  return res.invite;
});
