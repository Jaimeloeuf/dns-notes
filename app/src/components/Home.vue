<template>
  <div class="columns is-multiline">
    <div class="column is-full">
      <router-link class="button is-fullwidth" :to="{ name: 'search' }">
        Search
      </router-link>
    </div>

    <div class="column is-full">
      <router-link class="button is-fullwidth" :to="{ name: 'view' }">
        View all notes
      </router-link>
    </div>

    <div class="column is-full">
      <router-link class="button is-fullwidth" :to="{ name: 'create' }">
        Create note
      </router-link>
    </div>

    <div class="column is-full">
      <button class="button is-light is-fullwidth" @click="logout">
        logout
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",

  methods: {
    async logout() {
      if (!confirm("Logout?")) return;

      // Signout current user
      await import("../firebase.js").then(({ auth }) => auth.signOut());

      // Redirect to login view
      this.$router.push({ name: "login" });
    },
  },
};
</script>
