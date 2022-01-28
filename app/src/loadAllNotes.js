import { getAuthHeader } from "./firebase.js";
import { oof } from "simpler-fetch";

/**
 * Vuex action to load all notes from API.
 * Only used on first joining an organization, where all notes is pulled instead of pulling all the events and applying them 1 by 1.
 * This helps to speed up processes where there are thousands of changes/events vs hundreds of actual records.
 *
 * This vuex action is in its own module so that it can be lazily loaded,
 * as it is not always used, usually only on first joining an organization.
 */
export default async function loadAllNotes({ commit, dispatch }) {
  try {
    // Get all notes from the org that user's token is associated with
    const res = await oof
      .GET("/note/all")
      .header(await getAuthHeader())
      .runJSON();

    // If the API call failed, recursively dispatch itself again if user wants to retry,
    // And always make sure that this method call ends right here by putting it in a return expression
    if (!res.ok)
      return (
        confirm(`Error: \n${res.error}\n\nTry again?`) &&
        dispatch("loadAllNotes")
      );

    // Might need someway to update the ID? Like get the ID back then inject into the object
    commit("setNotes", res.notes);
  } catch (error) {
    // For errors that cause API call itself to throw
    console.error(error);

    // If the API call failed, recursively dispatch itself again if user wants to retry,
    // And always make sure that this method call ends right here by putting it in a return expression
    return (
      confirm(`Error: \n${error.message}\n\nTry again?`) &&
      dispatch("loadAllNotes")
    );
  }
}
