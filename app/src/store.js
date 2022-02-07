import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { getAuthHeader } from "./firebase.js";
import { oof } from "simpler-fetch";

import { syncPost, failed } from "./store-utils.js";

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

    // Mutation to edit a single note
    editNote: (state, note) =>
      (state.notes[note.id] = { ...state.notes[note.id], ...note }),

    // Mutation to set a new last sync time
    setLastSync: (state, lastSync) => (state.lastSync = lastSync),

    // Mutation to set all notes at once to override all previous notes
    // Only used when you want to load all notes in with a clean state
    setNotes: (state, notes) => (state.notes = notes),

    reset: (state) => Object.assign(state, defaultState()),
  },

  actions: {
    loadAllNotes: async (context) =>
      import("./loadAllNotes.js").then(({ default: fn }) => fn(context)),

    async sync({ commit, state, dispatch }) {
      try {
        const res = await oof
          .GET(`/note/sync/${state.org}/${state.lastSync}`)
          .header(await getAuthHeader())
          .runJSON();

        if (!res.ok) return failed(res.error, dispatch, "sync");

        // Apply all the events / changes one by one using the various mutations
        for (const event of res.events)
          switch (event.type) {
            case "add":
              commit("addNewNote", event.note);
              break;

            case "del":
              commit("deleteNote", event.noteID);
              break;

            case "edit":
              commit("editNote", event.note);
              break;

            default:
              throw new Error(
                `Internal Error: Invalid event type '${event.type}' received from sync API`
              );
          }

        // Update last sync time only after events are ran so in case it crashes, the events can be re-ran
        commit("setLastSync", res.time);
      } catch (error) {
        // For errors that cause API call itself to throw
        console.error(error);
        return failed(res.error, dispatch, "sync");
      }
    },

    async newNote({ commit, state, dispatch }, note) {
      try {
        const res = await syncPost(state, { type: "add", note });
        if (!res.ok) return failed(res.error, dispatch, "newNote");

        // Add note into state with ID from API
        commit("addNewNote", { ...note, id: res.id });
      } catch (error) {
        // For errors that cause API call itself to throw
        console.error(error);
        return failed(res.error, dispatch, "newNote");
      }
    },

    async deleteNote({ commit, state, dispatch }, noteID) {
      try {
        const res = await syncPost(state, { type: "del", noteID });
        if (!res.ok) return failed(res.error, dispatch, "deleteNote");

        commit("deleteNote", noteID);
      } catch (error) {
        // For errors that cause API call itself to throw
        console.error(error);
        return failed(res.error, dispatch, "deleteNote");
      }
    },

    async editNote({ commit, state, dispatch }, note) {
      try {
        const res = await syncPost(state, { type: "edit", note });
        if (!res.ok) return failed(res.error, dispatch, "editNote");

        commit("editNote", note);
      } catch (error) {
        // For errors that cause API call itself to throw
        console.error(error);
        return failed(res.error, dispatch, "editNote");
      }
    },
  },
});
