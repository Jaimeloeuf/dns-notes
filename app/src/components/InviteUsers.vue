<template>
  <div class="columns is-multiline is-vcentered mx-6 my-6 px-6 py-6">
    <div class="column">
      <p class="title is-3">Invite users to</p>
      <p class="subtitle is-4">{{ org }}</p>
    </div>

    <div class="column is-narrow">
      <button class="button is-light is-fullwidth" @click="$router.back">
        Back
      </button>
    </div>

    <div class="column is-full mt-4">
      <hr />
    </div>

    <div class="column is-full">
      <div class="tabs is-large is-centered">
        <ul>
          <li
            :class="{ 'is-active': tab === 'individual' }"
            @click="tab = 'individual'"
          >
            <a>Individual Invites</a>
          </li>
          <li :class="{ 'is-active': tab === 'bulk' }" @click="tab = 'bulk'">
            <a>Bulk Invite</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="column is-full" v-if="tab === 'individual'">
      <div class="columns is-multiline">
        <div class="column is-full">
          <p class="title is-4">Individual</p>
        </div>

        <div class="column">
          <label>
            <b>Email</b>

            <input
              class="input"
              type="text"
              v-model="email"
              placeholder="E.g. user@example.com"
            />
          </label>
        </div>

        <div class="column is-narrow">
          <label>
            <b>Admin</b>
            Click to toggle
            <br />

            <button
              class="button is-light is-fullwidth"
              :class="{ 'is-success': admin }"
              @click="admin = !admin"
            >
              {{ admin }}
            </button>
          </label>
        </div>

        <div class="column is-narrow">
          <label>
            <b>Send Email Invite</b>

            <button
              class="button is-light is-success is-fullwidth"
              @click="inviteIndividual"
            >
              Invite
            </button>
          </label>
        </div>

        <div class="column is-full">
          <b>
            *Once invited, ask user to login or reload if logged in to accept
            invitation.
          </b>
        </div>
      </div>
    </div>

    <div class="column is-full" v-else-if="tab === 'bulk'">
      <div class="columns is-multiline">
        <div class="column is-full">
          <p class="title is-4">Bulk</p>
        </div>

        <div class="column">
          <b>Download CSV template</b>
          <br />
          Fill in this template with emails and admin status to bulk invite
        </div>

        <div class="column is-narrow">
          <a
            class="button is-light is-success is-fullwidth"
            href="/csv-template.csv"
            download="DNS-Notes-Bulk-Invite.csv"
          >
            Download
          </a>
        </div>

        <div class="column is-full">
          <hr />
        </div>

        <div class="column is-full">
          Sample of how to fill in the CSV template
          <br />
          <img
            src="/sample-csv-format.png"
            alt="Sample CSV format"
            style="width: 100%; height: auto"
          />
        </div>

        <div class="column is-full">
          <div class="file is-large is-centered is-fullwidth is-boxed has-name">
            <label class="file-label">
              <input
                type="file"
                accept=".csv"
                @change="onFileChange"
                class="file-input"
                name="images"
              />

              <span class="file-cta">
                <span class="file-icon">
                  <i class="fas fa-upload"></i>
                </span>
                <span class="file-label">
                  Click to select file
                  <br />
                  OR
                  <br />
                  Drag file here
                </span>
              </span>

              <!-- Only show file name if file is uploaded -->
              <span class="file-name has-background-warning">
                <span v-if="bulkInviteCSV">
                  {{ bulkInviteCSV.name }}
                </span>
              </span>
            </label>
          </div>
        </div>

        <div class="column is-full" v-if="bulkInviteCSV">
          <button
            class="button is-light is-success is-fullwidth is-large"
            @click="inviteBulk"
          >
            Bulk Invite
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "InviteUsers",

  computed: mapState(["org"]),

  data() {
    return {
      tab: "individual",

      email: undefined,
      admin: false,

      bulkInviteCSV: undefined,
    };
  },

  methods: {
    onFileChange(event) {
      this.bulkInviteCSV = event.target.files[0];
    },

    async inviteIndividual() {
      this.$store.commit("loading", true);
      await this.$store.dispatch("inviteIndividual", {
        // Email must be lowercase as the email in tokens are all lower cased by default
        email: this.email.toLowerCase(),
        admin: this.admin,
      });
      this.$store.commit("loading", false);

      // Reset the inputs
      // Reset the data values to its original state by re-running the data method
      // https://github.com/vuejs/vue/issues/702#issuecomment-308991548
      // https://www.carlcassar.com/articles/reset-data-in-a-vue-component
      Object.assign(this.$data, this.$options.data());
    },

    async inviteBulk() {
      this.$store.commit("loading", true);

      const { default: parseCSV } = await import("../utils/parseCSV.js");
      const parsedUsers = await parseCSV(this.bulkInviteCSV);
      await this.$store.dispatch("inviteBulk", parsedUsers);

      this.$store.commit("loading", false);

      alert("Invites sent!");

      // Remove the CSV file object to give visual feedback that transaction completed
      this.bulkInviteCSV = undefined;
    },
  },
};
</script>
