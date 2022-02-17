import { getAuthHeader } from "../../firebase.js";
import { oof } from "simpler-fetch";

/**
 * Abstraction over API call to send event data to the sync endpoint
 * @param {object} state Vuex state object to get the org ID
 * @param {object} event Event object to send to API for syncing
 */
async function syncPost(state, dispatch, event) {
  const res = await oof
    .POST(`/note/sync/${state.org}/${state.lastSync}`)
    .header(await getAuthHeader())
    .data({ event })
    .runJSON();

  if (!res.ok) throw new Error(res.error);

  dispatch("syncEvents", res);
}

export const newNote = async ({ state, dispatch }, note) =>
  syncPost(state, dispatch, { type: "add", note });

export const deleteNote = async ({ state, dispatch }, noteID) =>
  syncPost(state, dispatch, { type: "del", noteID });

export const editNote = async ({ state, dispatch }, note) =>
  syncPost(state, dispatch, { type: "edit", note });
