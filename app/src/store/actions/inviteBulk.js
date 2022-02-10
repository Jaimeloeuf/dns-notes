import { getAuthHeader } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { failed } from "../utils.js";

/**
 * Vuex action to bulk invite users to admin's own org.
 * Only used by admins thus lazily loaded.
 */
export default async function inviteBulk({ state, dispatch }, users) {
  try {
    const res = await oof
      .POST(`/user/invite/${state.org}`)
      .header(await getAuthHeader())
      .data({ users })
      .runJSON();

    if (!res.ok) return failed(res.error, dispatch, "inviteBulk");
  } catch (error) {
    // For errors that cause API call itself to throw
    console.error(error);
    return failed(error.message, dispatch, "inviteBulk");
  }
}
