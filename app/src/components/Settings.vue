<template>
  <div class="columns is-multiline mx-6 my-6 px-6 py-6">
    <div class="column is-full">
      <p class="title is-3">Settings</p>

      <p>Organisation: {{ org }}</p>
      <p>User: {{ email }}</p>

      <!-- Convert to string as admin is only set to true if true, else if false, it is not set at all -->
      <p>Admin: {{ admin ? "Yes" : "No" }}</p>
    </div>

    <!-- Settings for Admins only -->
    <div class="column is-full" v-if="admin">
      <div class="columns is-multiline">
        <div class="column is-full">
          <hr />
        </div>

        <div class="column is-full">
          <p class="title is-5">Admin settings</p>
        </div>

        <div class="column is-full">
          <router-link
            class="button is-light is-success is-fullwidth is-large"
            :to="{ name: 'invite-users' }"
          >
            Invite users to organization
          </router-link>
        </div>

        <div class="column is-full">
          <router-link
            class="button is-light is-success is-fullwidth is-large"
            :to="{ name: 'manage-user' }"
          >
            Manage Users
          </router-link>
        </div>
      </div>
    </div>

    <div class="column is-full">
      <hr />
    </div>

    <div class="column is-full">
      <p class="title is-5">User settings</p>
    </div>

    <div class="column is-half">
      <button class="button is-light is-danger is-fullwidth" @click="leaveOrg">
        Leave organization
      </button>
    </div>

    <div class="column is-half">
      <button class="button is-light is-danger is-fullwidth" @click="delAcc">
        Delete account
      </button>
    </div>

    <div class="column is-full">
      <hr />
    </div>

    <div class="column is-half">
      <button class="button is-light is-danger is-fullwidth" @click="logout">
        logout
      </button>
    </div>

    <div class="column is-half">
      <router-link
        class="button is-light is-warning is-fullwidth"
        :to="{ name: 'home' }"
      >
        Home
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import logout from "../utils/logout.js";

export default {
  name: "Settings",

  computed: mapState(["org", "email", "admin"]),

  methods: {
    logout,

    ...mapActions(["leaveOrg"]),
    async delAcc() {},
  },
};
</script>
