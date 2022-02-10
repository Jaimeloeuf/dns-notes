import { getAuthHeader } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { failed } from "../utils.js";

/**
 * Vuex action to check for org invites.
 * Only used by new users thus lazily loaded.
 */
export default async function checkForInvites({ dispatch }) {
  try {
    const res = await oof
      .GET("/user/invite/check/pending")
      .header(await getAuthHeader())
      .runJSON();

    if (!res.ok)
      if (res.status === 404) console.log("checkForInvites action: No invites");
      else return failed(res.error, dispatch, "checkForInvites");

    return res.invite;
  } catch (error) {
    // For errors that cause API call itself to throw
    console.error(error);
    return failed(error.message, dispatch, "checkForInvites");
  }
}
