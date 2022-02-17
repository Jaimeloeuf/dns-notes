import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { getAuthHeader } from "../firebase.js";
import { oof } from "simpler-fetch";

import { lazilyLoad, syncPost, errorHandlingWrapper, failed } from "./utils.js";

/**
 * Function to get the default state of vuex store as a new object everytime it is called.
 * Defined externally so that reset mutation can use this too to clear the state.
 * @returns {object} Default vuex state object
 */
const defaultState = () => ({
  // Defaults to the smallest valid time number, 0
  // This value should be set whenever notes or events are received from the API
  lastSync: 0,

  // The orgID of the user, set during login or after first creating an org
  org: undefined,

  // User's email
  email: undefined,

  // Boolean if user is admin of the organization
  admin: undefined,

  // Shared global loading flag to show/hide loader in App.vue
  loading: false,

  notes: {},
});

export default createStore({
  plugins: [createPersistedState()],

  state() {
    return defaultState();
  },

  getters: {
    notes: (state) =>
      Object.values(state.notes).sort((a, b) => b.time - a.time),
  },

  mutations: {
    // Generic mutation to set anything in state
    setter: (state, payload) => (state[payload[0]] = payload[1]),

    // Mutation to update the shared global loading state
    loading: (state, loadingState) => (state.loading = loadingState),

    // Mutation to add a single new note
    addNewNote: (state, note) => (state.notes[note.id] = note),

    // Mutation to remove a single new note
    deleteNote: (state, noteID) => delete state.notes[noteID],

    // Mutation to set a new last sync time
    setLastSync: (state, lastSync) => (state.lastSync = lastSync),

    // Mutation to set all notes at once to override all previous notes
    // Only used when you want to load all notes in with a clean state
    setNotes: (state, notes) => (state.notes = notes),

    reset: (state) => Object.assign(state, defaultState()),
  },

  actions: {
    // Could have written it like this too, but the bundler cannot analyze dynamic import calls
    // which meant that the full paths were used even in the full builds where all resource names are mangled
    // const lazyLoader = (path) => async (context, payload) =>
    //   import(path /* @vite-ignore */).then(({ default: fn }) =>
    //     fn(context, payload)
    //   );
    // loadAllNotes: lazyLoader("./actions/loadAllNotes.js"),

    loadAllNotes: lazilyLoad(() => import("./actions/loadAllNotes.js")),
    checkForInvites: lazilyLoad(() => import("./actions/checkForInvites.js")),
    acceptInvite: lazilyLoad(() => import("./actions/acceptInvite.js")),
    rejectInvite: lazilyLoad(() => import("./actions/rejectInvite.js")),
    inviteIndividual: lazilyLoad(() => import("./actions/inviteIndividual.js")),
    inviteBulk: lazilyLoad(() => import("./actions/inviteBulk.js")),

    sync: errorHandlingWrapper(async function sync({ state, dispatch }) {
      const res = await oof
        .GET(`/note/sync/${state.org}/${state.lastSync}`)
        .header(await getAuthHeader())
        .runJSON();

      if (!res.ok) throw new Error(res.error);

      dispatch("syncEvents", res);
    }),

    syncEvents: errorHandlingWrapper(function syncEvents(
      { commit },
      { events, time }
    ) {
      // Apply all the events / changes one by one using the various mutations
      for (const event of events)
        switch (event.type) {
          case "add":
            commit("addNewNote", event.note);
            break;

          case "del":
            commit("deleteNote", event.noteID);
            break;

          case "edit":
            // Semantically same as delete + create, so use addNewNote to overwrite existing note
            commit("addNewNote", event.note);
            break;

          default:
            throw new Error(
              `Internal Error: Invalid event type '${event.type}' received from sync API`
            );
        }

      // Update last sync time only after events are ran so in case it crashes, the events can be re-ran
      commit("setLastSync", time);
    }),

    async newNote({ state, dispatch }, note) {
      try {
        const res = await syncPost(state, { type: "add", note });
        if (!res.ok) return failed(res.error, dispatch, "newNote");

        dispatch("syncEvents", res);
      } catch (error) {
        // For errors that cause API call itself to throw
        console.error(error);
        return failed(error.message, dispatch, "newNote");
      }
    },

    async deleteNote({ state, dispatch }, noteID) {
      try {
        const res = await syncPost(state, { type: "del", noteID });
        if (!res.ok) return failed(res.error, dispatch, "deleteNote");

        dispatch("syncEvents", res);
      } catch (error) {
        // For errors that cause API call itself to throw
        console.error(error);
        return failed(error.message, dispatch, "deleteNote");
      }
    },

    async editNote({ state, dispatch }, note) {
      try {
        const res = await syncPost(state, { type: "edit", note });
        if (!res.ok) return failed(res.error, dispatch, "editNote");

        dispatch("syncEvents", res);
      } catch (error) {
        // For errors that cause API call itself to throw
        console.error(error);
        return failed(error.message, dispatch, "editNote");
      }
    },
  },
});
