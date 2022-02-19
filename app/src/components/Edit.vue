<template>
  <NoteForm :default="note" @edit-done="edit">
    <template #header>
      <p class="title is-3">Edit note</p>
      <p class="mb-2">
        Editing overwrites the original note, semantically similiar to deleting
        the original and creating a new one.
      </p>
      <p>Meaning author and created time will be changed.</p>
    </template>

    <template #onCompleteBtnTxt>Update</template>
  </NoteForm>
</template>

<script>
import NoteForm from "./NoteForm.vue";

export default {
  name: "Edit",

  components: { NoteForm },

  props: ["noteID"],

  data() {
    return {
      note: this.$store.state.notes[this.noteID],
    };
  },

  methods: {
    async edit(note) {
      await this.$store.dispatch("withLoader", ["editNote", note]);

      this.$router.push({ name: "view" });
    },
  },
};
</script>
