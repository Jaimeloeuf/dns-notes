import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { getAuthHeader } from "./firebase.js";
import { oof } from "simpler-fetch";

import { syncPost, failed } from "./store-utils.js";

export default createStore({
  plugins: [createPersistedState()],

  state() {
    return {
      lastSync: 0,

      // The orgID of the user, set during login or after first creating an org
      org: undefined,

      // Boolean if user is admin of the organization
      admin: undefined,

      // Shared global loading flag to show/hide loader in App.vue
      loading: false,

      notes: {},
    };
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

    // Mutation to set all notes
    setNotes: (state, notes) => (state.notes = { ...state.notes, ...notes }),
  },

  actions: {
    loadAllNotes: async (context) =>
      import("./loadAllNotes.js").then(({ default: fn }) => fn(context)),

    async sync({ commit, state, dispatch }) {
      const res = await oof
        .GET(`/note/sync/${state.org}/${state.lastSync}`)
        .header(await getAuthHeader())
        .runJSON();

      // If the API call failed, recursively dispatch itself again if user wants to retry,
      // And always make sure that this method call ends right here by putting it in a return expression
      if (!res.ok)
        return (
          confirm(`Error: \n${res.error}\n\nTry again?`) && dispatch("sync")
        );

      // No events / changes to apply
      if (res.events.length === 0) return;

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
      commit("setLastSync", res.lastSync);
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
