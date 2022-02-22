<template>
  <div class="columns is-multiline mx-6 my-6 px-6 py-6">
    <div class="column is-full">
      <p class="title is-3">Welcome</p>

      <p>
        You do not belong to any organization right now, please create or join
        an organization to get started!
      </p>
      <br />

      <p>
        What is an organization?
        <br />
        An organization has DNS notes and users. Users can create and access
        their own organization's notes.
      </p>
    </div>

    <div class="column is-full">
      <hr />
    </div>

    <div class="column is-full" v-if="invite">
      <div class="columns is-multiline">
        <div class="column is-full">
          <p class="title is-3">Pending Invitation</p>
        </div>

        <div class="column is-full">
          <p class="subtitle is-4">
            You have a pending invitation to join an organization!
          </p>

          Organization ID: {{ invite.org }}
          <br />

          Admin Status: {{ invite.admin }}
          <br />

          Invited By: {{ invite.invitedBy }}
          <br />
        </div>

        <div class="column is-narrow">
          <button
            class="button is-light is-danger is-fullwidth"
            @click="rejectInvite"
          >
            Reject
          </button>
        </div>

        <div class="column">
          <button
            class="button is-light is-success is-fullwidth"
            @click="acceptInvite"
          >
            Join
          </button>
        </div>
      </div>
    </div>

    <div class="column is-full" v-else>
      <div class="columns is-multiline">
        <div class="column is-full">
          <p class="title is-3">Organization</p>
        </div>

        <div class="column is-half">
          <button
            class="button is-light is-success is-fullwidth is-large"
            @click="tab = 'create'"
          >
            Create
          </button>
        </div>

        <div class="column is-half">
          <button
            class="button is-light is-success is-fullwidth is-large"
            @click="tab = 'join'"
          >
            Join
          </button>
        </div>

        <!-- @todo Might make this its own view as have to handle payment too? -->
        <div class="column box is-full" v-if="tab === 'create'">
          <div class="columns is-multiline">
            <div class="column is-full" v-if="true">
              <label>
                <b>Enter organization ID</b>
                <br />
                <div class="content">
                  <ul>
                    <li>Must be alphanumeric ascii and dashes</li>
                    <li>No spaces allowed</li>
                    <li>Case Sensitive</li>
                    <li>At least 2 characters</li>
                    <li>At most 60 characters</li>
                    <li>Must be unique</li>

                    <!-- Because hard to update all docs's orgID and almost impossible to update all user's custom claims -->
                    <li>CANNOT BE CHANGED</li>
                  </ul>
                </div>

                <div class="field has-addons">
                  <div class="control is-expanded">
                    <input
                      v-autofocus
                      ref="orgIDField"
                      type="text"
                      v-model="orgID"
                      placeholder="E.g. google / facebook / your-company-name"
                      required
                      class="input"
                      style="width: 100%"
                    />
                  </div>
                  <div class="control">
                    <button class="button" @click="clearOrgIDInput">
                      clear
                    </button>
                  </div>
                </div>
              </label>
            </div>

            <div class="column is-full">
              Your Email: <b>{{ email }}</b>
            </div>

            <div class="column is-full">
              <button
                class="button is-light is-success is-fullwidth"
                @click="create"
              >
                Create
              </button>
            </div>
          </div>
        </div>

        <div class="column box is-full" v-else-if="tab === 'join'">
          <div class="columns is-multiline">
            <div class="column is-full" v-if="true">
              <label>
                <b>Enter organization ID</b> (Case Sensitive)

                <div class="field has-addons">
                  <div class="control is-expanded">
                    <input
                      v-autofocus
                      ref="orgIDField"
                      type="text"
                      v-model="orgID"
                      placeholder="E.g. google / facebook / your-company-name"
                      required
                      class="input"
                      style="width: 100%"
                    />
                  </div>
                  <div class="control">
                    <button class="button" @click="clearOrgIDInput">
                      clear
                    </button>
                  </div>
                </div>
              </label>
            </div>

            <div class="column is-full">
              Your Email: <b>{{ email }}</b>
            </div>

            <div class="column is-full">
              Request Admin Permissions?
              <input v-model="admin" type="checkbox" class="checkbox ml-2" />
            </div>

            <div class="column is-full">
              <button
                class="button is-light is-success is-fullwidth"
                @click="request"
              >
                Request to Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="column is-full">
      <hr />
    </div>

    <div class="column is-narrow">
      <button class="button is-light is-danger is-fullwidth" @click="delAcc">
        Delete Account
      </button>
    </div>

    <div class="column">
      <button class="button is-light is-fullwidth" @click="logout">
        logout
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import logout from "../utils/logout.js";

export default {
  name: "NewUser",

  computed: mapState(["email"]),

  data() {
    return {
      invite: undefined,

      tab: undefined,

      orgID: undefined,
      admin: false,
    };
  },

  mounted() {
    // Check on mount instead of check on login so that they can just reload site to check for new invites
    this.checkForInvites();
  },

  methods: {
    logout,

    // Clear the search input box and re-focus on the search field
    clearOrgIDInput() {
      this.orgID = "";
      this.$refs.orgIDField.focus();
    },

    async checkForInvites() {
      this.invite = await this.$store.dispatch("withLoader", [
        "checkForInvites",
      ]);
    },

    async acceptInvite() {
      await this.$store.dispatch("withLoader", [
        "acceptInvite",
        this.invite.id,
      ]);

      // Redirect to actual home page once all new data is loaded
      this.$router.replace({ name: "home" });
    },

    async rejectInvite() {
      if (!confirm("Are you sure?")) return;

      await this.$store.dispatch("rejectInvite", this.invite.id);

      // Remove the invite object to update the UI
      this.invite = undefined;
    },

    async request() {},

    async create() {},

    async delAcc() {
      this.$store.dispatch("withLoader", ["delAcc"]);
    },
  },

  directives: {
    // Custom directive to autofocus on a input element
    autofocus: {
      // Focus the element when the bound element is mounted onto the DOM
      mounted: (element) => element.focus(),
    },
  },
};
</script>
