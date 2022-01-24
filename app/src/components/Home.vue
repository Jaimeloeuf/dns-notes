<template>
  <div class="columns is-multiline">
    <div class="column is-half">
      <router-link class="button is-fullwidth" :to="{ name: 'view' }">
        View all notes
      </router-link>
    </div>

    <div class="column is-half">
      <router-link class="button is-fullwidth" :to="{ name: 'create' }">
        Create note
      </router-link>
    </div>

    <div class="column">
      <button class="button is-light" @click="logout">logout</button>
    </div>
  </div>
</template>

<script>
import { auth } from "../firebase.js";

export default {
  name: "Home",

  methods: {
    async logout() {
      if (!confirm("Logout?")) return;

      // Signout current user
      await auth.signOut();

      // Redirect to login view
      this.$router.push({ name: "login" });
    },
  },
};
</script>
