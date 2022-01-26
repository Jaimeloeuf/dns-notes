<template>
  <div class="px-5 py-5" style="max-width: 36em">
    <div class="columns is-multiline box">
      <div class="column is-full">
        <p class="title is-3">Create new note</p>
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
                placeholder="E.g. app.saas.com for a CNAME example"
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
              @click="create"
            >
              Create Note
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Create",

  props: ["hostname", "name"],

  data() {
    return {
      provider: this.hostname,
      domain: undefined,
      subdomain: this.name,
      value: undefined,
      note: undefined,

      type: undefined,
      recordTypes: ["CNAME", "A", "AAAA", "TXT", "MX"],
    };
  },

  methods: {
    async create() {
      this.$store.commit("loading", true);
      await this.$store.dispatch("newNote", {
        // @todo Fix the ID, this needs to be from backend?
        id: Math.random().toString(36).slice(2, 8),
        time: unixseconds(),

        provider: this.provider,
        domain: this.domain,
        subdomain: this.subdomain,
        value: this.value,
        note: this.note,
        type: this.type,
      });
      this.$store.commit("loading", false);

      this.$router.push({ name: "view" });
    },
  },
};
</script>
