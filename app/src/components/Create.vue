<template>
  <NoteForm
    :default="{ provider: hostname, subdomain: name }"
    @edit-done="create"
  >
    <template #header>
      <p class="title is-3">Create new note</p>
    </template>

    <template #onCompleteBtnTxt>Create</template>
  </NoteForm>
</template>

<script>
import NoteForm from "./NoteForm.vue";

export default {
  name: "Create",

  components: { NoteForm },

  props: ["hostname", "name"],

  methods: {
    async create(note) {
      await this.$store.dispatch("withLoader", ["newNote", note]);

      this.$router.push({ name: "view" });
    },
  },
};
</script>
