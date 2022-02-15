import { getAuthHeader } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { errorHandlingWrapper } from "../utils.js";

/**
 * Vuex action to bulk invite users to admin's own org.
 * Only used by admins thus lazily loaded.
 */
export default errorHandlingWrapper(async function inviteBulk(
  { state },
  users
) {
  const res = await oof
    .POST(`/user/invite/${state.org}`)
    .header(await getAuthHeader())
    .data({ users })
    .runJSON();

  if (!res.ok) throw new Error(res.error);
});
