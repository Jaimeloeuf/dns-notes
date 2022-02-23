import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { getAuthHeader } from "../firebase.js";
import { oof } from "simpler-fetch";

import { lazilyLoad, errorHandlingWrapper } from "./utils.js";

// Import actions from 'note' module as these will almost always be used
import { newNote, deleteNote, editNote } from "./actions/note.js";

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
    // Action to call other actions and show loader while waiting for it to complete
    async withLoader({ commit, dispatch }, [action, payload]) {
      commit("loading", true);
      const res = await dispatch(action, payload);
      commit("loading", false);
      return res;
    },

    /* All the lazily loaded actions */
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
    leaveOrg: lazilyLoad(() => import("./actions/leaveOrg.js")),
    delAcc: lazilyLoad(() => import("./actions/delAcc.js")),
    createOrg: lazilyLoad(() => import("./actions/createOrg.js")),

    /* Actions for POSTing updates to API */
    newNote: errorHandlingWrapper(newNote),
    deleteNote: errorHandlingWrapper(deleteNote),
    editNote: errorHandlingWrapper(editNote),

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
  },
});
