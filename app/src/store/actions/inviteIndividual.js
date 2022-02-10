import { getAuthHeader } from "../../firebase.js";
import { oof } from "simpler-fetch";

import { failed } from "../utils.js";

/**
 * Vuex action to invite an individual email address to admin's own org.
 * Only used by admins thus lazily loaded.
 */
export default async function inviteIndividual({ state, dispatch }, user) {
  try {
    const res = await oof
      .POST(`/user/invite/${state.org}`)
      .header(await getAuthHeader())
      .data({ user })
      .runJSON();

    if (!res.ok) return failed(res.error, dispatch, "inviteIndividual");
  } catch (error) {
    // For errors that cause API call itself to throw
    console.error(error);
    return failed(error.message, dispatch, "inviteIndividual");
  }
}
