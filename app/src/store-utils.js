/*
  Module for utilities used by the vuex store
*/

import { getAuthHeader } from "./firebase.js";
import { oof } from "simpler-fetch";

/**
 * Abstraction over API call to send event data to the sync endpoint
 * @param {object} state Vuex state object to get the org ID
 * @param {object} event Event object to send to API for syncing
 * @returns {Promise<Response>} Returns API call's promise
 */
export const syncPost = async (state, event) =>
  oof
    .POST(`/note/sync/${state.org}`)
    .header(await getAuthHeader())
    .data({ event })
    .runJSON();

/**
 * If the API call failed, recursively dispatch the action again if user wants to retry,
 * And caller should always make sure to return so code execution does not continue
 * @param {String} errorString Error message to show user when asking them if they want to retry
 * @param {function} dispatch The vuex dispatch action function
 * @param {String} action The name of the vuex action that calls this function, to recursively dispatch
 */
export const failed = (errorString, dispatch, action) =>
  confirm(`Error: \n${errorString}\n\nTry again?`) && dispatch(action);
