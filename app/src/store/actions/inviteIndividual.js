import { getAuthHeader } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { errorHandlingWrapper } from "../utils.js";

/**
 * Vuex action to invite an individual email address to admin's own org.
 * Only used by admins thus lazily loaded.
 */
export default errorHandlingWrapper(async function inviteIndividual(
  { state },
  user
) {
  const res = await oof
    .POST(`/user/invite/${state.org}`)
    .header(await getAuthHeader())
    .data({ user })
    .runJSON();

  if (!res.ok) throw new Error(res.error);
});
