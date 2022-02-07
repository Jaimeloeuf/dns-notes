<template>
  <div class="columns is-multiline mx-6 my-6 px-6 py-6">
    <div class="column is-full">
      <p class="title is-3">User</p>

      <p>Organisation: {{ org }}</p>
      <p>User: {{ email }}</p>
      <p>Admin: {{ admin }}</p>
    </div>

    <div class="column is-full">
      <hr />
    </div>

    <div class="column is-full">
      <router-link
        class="button is-light is-success is-fullwidth is-large"
        :to="{ name: 'view' }"
      >
        View all notes
      </router-link>
    </div>

    <div class="column is-full">
      <router-link
        class="button is-light is-success is-fullwidth is-large"
        :to="{ name: 'create' }"
      >
        Create note
      </router-link>
    </div>

    <div class="column is-full">
      <hr />
    </div>

    <div class="column is-half">
      <router-link
        class="button is-light is-warning is-fullwidth"
        :to="{ name: 'settings' }"
      >
        settings
      </router-link>
    </div>

    <div class="column is-half">
      <button class="button is-light is-danger is-fullwidth" @click="logout">
        logout
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import logout from "../utils/logout.js";

export default {
  name: "Home",

  computed: mapState(["org", "email", "admin"]),

  methods: {
    logout,
  },
};
</script>
