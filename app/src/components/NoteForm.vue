<template>
  <div class="px-5 py-5" style="max-width: 30em">
    <div class="columns is-multiline box">
      <div class="column is-full">
        <p class="title is-3">{{ title }}</p>
      </div>

      <div class="column is-full">
        <div class="columns is-multiline">
          <div class="column is-full">
            <label>
              <b>DNS Provider</b>

              <input
                class="input"
                type="text"
                v-model="provider"
                placeholder="E.g. Cloudflare"
              />
            </label>
          </div>

          <div class="column is-full">
            <label>
              <b>Domain</b>

              <input
                class="input"
                type="text"
                v-model="domain"
                placeholder="E.g. mydomain.com"
              />
            </label>
          </div>

          <div class="column is-full">
            <label>
              <b>Record Type</b>
              <br />

              <div class="select is-fullwidth">
                <select v-on:change="(event) => (type = event.target.value)">
                  <option hidden disabled selected value>
                    Please select an option
                  </option>

                  <option
                    v-for="recordType in recordTypes"
                    :value="recordType"
                    :key="recordType"
                    :selected="recordType === type"
                  >
                    {{ recordType }}
                  </option>
                </select>
              </div>
            </label>
          </div>

          <div class="column is-full">
            <label>
              <b>Subdomain</b>

              <input
                class="input"
                type="text"
                v-model="subdomain"
                placeholder="E.g. subdomain"
              />
            </label>
          </div>

          <div class="column is-full">
            <label>
              <b>Value</b>

              <input
                class="input"
                type="text"
                v-model="value"
                placeholder="E.g. saas.com for CNAME or 150.1.1.2 for A records"
              />
            </label>
          </div>

          <div class="column is-full">
            <label>
              <b>Description</b>
              <br />

              <textarea
                v-model="note"
                class="textarea"
                placeholder="Leave a note for this record!"
              />
            </label>
          </div>

          <div class="column is-narrow">
            <button class="button is-fullwidth py-5" @click="$router.back">
              Cancel
            </button>
          </div>

          <div class="column">
            <button
              class="button is-fullwidth py-5 is-light is-success"
              @click="done"
            >
              {{ onCompleteBtn }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import unixseconds from "unixseconds";

export default {
  name: "NoteForm",

  props: ["default", "title", "onCompleteBtn"],

  data() {
    return {
      provider: undefined,
      domain: undefined,
      subdomain: undefined,
      value: undefined,
      note: undefined,

      type: undefined,
      recordTypes: [
        "CNAME",
        "A",
        "AAAA",
        "TXT",
        "MX",
        "NS",
        "ANAME",
        "SPF",
        "SOA",
        "SRV",
      ],

      ...this.default,
    };
  },

  methods: {
    async done() {
      this.$emit("edit-done", {
        time: unixseconds(),

        // @todo This needs to be verified by API too against the token
        // The user who created it and the organization
        user: this.$store.state.email,
        org: this.$store.state.org,

        provider: this.provider,
        domain: this.domain,
        subdomain: this.subdomain,
        value: this.value,
        note: this.note,
        type: this.type,
      });
    },
  },
};
</script>
