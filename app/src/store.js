import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { getAuthHeader } from "./firebase.js";
import { oof } from "simpler-fetch";

export default createStore({
  plugins: [createPersistedState()],

  state() {
    return {
      lastSync: 0,

      // Shared global loading flag to show/hide loader in App.vue
      loading: false,

      // @todo To delete the UI testing data once complete
      // notes: {}
      notes: {
        sldgjldskjglsd: {
          id: "sldgjldskjglsd",
          provider: "cloudflare",
          domain: "covid.gov.sg",
          type: "CNAME",
          subdomain: "_lnslgknlsfIOH_lsndlgdsl",
          value: "",
          note: "Domain verification for Emails",
          time: 1643184535,
        },
        rwihfnldbxf: {
          id: "rwihfnldbxf",
          provider: "route53",
          domain: "redeem.gov.sg",
          type: "CNAME",
          subdomain: "_23ikef_lsndlgdsl",
          value: "",
          note: "Domain verification for Emails",
          time: 1643184537,
        },
      },
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

    // Mutation to get older and older notes to append to the array
    setNotes: (state, notes) => (state.notes = { ...state.notes, ...notes }),
  },

  actions: {
    async sync({ commit, state, dispatch }) {
      const res = await oof
        .GET(`/sync/${state.lastSync}`)
        .header(await getAuthHeader())
        .runJSON();

      // If the API call failed, recursively dispatch itself again if user wants to retry,
      // And always make sure that this method call ends right here by putting it in a return expression
      if (!res.ok)
        return (
          confirm(`Error: \n${res.error}\n\nTry again?`) && dispatch("sync")
        );

      // No edits / changes to apply
      if (res.edits.length === 0) return;

      for (const edit of res.edits)
        switch (edit.type) {
          case "add":
            commit("addNewNote", edit.note);
            break;

          case "del":
            commit("deleteNote", edit.noteID);
            break;

          case "edit":
            commit("editNote", edit.note);
            break;

          default:
            throw new Error(
              `Internal Error: Invalid edit type '${edit.type}' received from sync API`
            );
        }

      // Update last sync time only after edit has ran so in case it crashes, the edits can be re-ran
      commit("setLastSync", res.lastSync);
    },

    async newNote({ commit, dispatch }, note) {
      // @todo Temporarily saving the note locally without any API sync first
      return commit("addNewNote", note);

      try {
        const res = await oof
          .POST("/note/new")
          .header(await getAuthHeader())
          .data({ note })
          .runJSON();

        // If the API call failed, recursively dispatch itself again if user wants to retry,
        // And always make sure that this method call ends right here by putting it in a return expression
        if (!res.ok)
          return (
            confirm(`Error: \n${res.error}\n\nTry again?`) &&
            dispatch("newNote")
          );

        // Might need someway to update the ID? Like get the ID back then inject into the object
        commit("addNewNote", note);
      } catch (error) {
        // For errors that cause API call itself to throw
        console.error(error);

        // If the API call failed, recursively dispatch itself again if user wants to retry,
        // And always make sure that this method call ends right here by putting it in a return expression
        return (
          confirm(`Error: \n${error.message}\n\nTry again?`) &&
          dispatch("newNote")
        );
      }
    },

    async deleteNote({ commit, dispatch }, noteID) {
      // @todo Temporarily update locally without any API sync first
      return commit("deleteNote", noteID);

      try {
        const res = await oof
          .POST(`/note/delete/${noteID}`)
          .header(await getAuthHeader())
          .runJSON();

        // If the API call failed, recursively dispatch itself again if user wants to retry,
        // And always make sure that this method call ends right here by putting it in a return expression
        if (!res.ok)
          return (
            confirm(`Error: \n${res.error}\n\nTry again?`) &&
            dispatch("deleteNote", noteID)
          );

        commit("deleteNote", noteID);
      } catch (error) {
        // For errors that cause API call itself to throw
        console.error(error);

        // If the API call failed, recursively dispatch itself again if user wants to retry,
        // And always make sure that this method call ends right here by putting it in a return expression
        return (
          confirm(`Error: \n${error.message}\n\nTry again?`) &&
          dispatch("deleteNote", noteID)
        );
      }
    },
  },
});
