<template>
  <NoteForm
    :default="{ provider: hostname, subdomain: name }"
    title="Create new note"
    onCompleteBtn="Create"
    @edit-done="create"
  />
</template>

<script>
import NoteForm from "./NoteForm.vue";

export default {
  name: "Create",

  components: { NoteForm },

  props: ["hostname", "name"],

  methods: {
    async create(note) {
      this.$store.commit("loading", true);
      await this.$store.dispatch("newNote", note);
      this.$store.commit("loading", false);

      this.$router.push({ name: "view" });
    },
  },
};
</script>
