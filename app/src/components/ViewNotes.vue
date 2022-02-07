<template>
  <div class="px-5 py-5">
    <div class="columns is-multiline">
      <div class="column">
        <p class="title is-3">Notes</p>
      </div>

      <div class="column is-narrow">
        <button class="button is-light is-fullwidth" @click="$router.back">
          Back
        </button>
      </div>

      <div class="column is-full">
        <label>
          <b>Search (by subdomain)</b>

          <div class="field has-addons">
            <div class="control is-expanded">
              <input
                v-autofocus
                ref="searchField"
                type="text"
                v-model="search_input"
                placeholder="E.g. www / mysubdomain / @"
                required
                class="input"
                style="width: 100%"
              />
            </div>
            <div class="control">
              <button class="button" @click="clearSearchInput">clear</button>
            </div>
          </div>
        </label>
      </div>

      <div class="column is-full">
        <div class="card px-5">
          <div class="card-content content">
            <div class="columns is-vcentered">
              <div class="column">
                <p class="subtitle is-4">Select to edit</p>
              </div>

              <div class="column is-narrow">
                <button class="button is-light is-success" @click="refresh">
                  Refresh
                </button>
              </div>
            </div>

            <div v-if="search_input !== '' && results.length === 0">
              No notes match your search input
            </div>

            <div v-else>
              <table>
                <!-- @todo
                  Add in organization this note belongs to
                  Add in time of note creation
                -->
                <tr>
                  <!-- Which DNS provider is this record stored in -->
                  <th>DNS provider</th>

                  <!-- Which domain is this record for -->
                  <th>Domain</th>

                  <!-- Type of DNS record, can be A/AAAA/CNAME/TXT -->
                  <th>Record Type</th>

                  <!-- The domain or subdomain you are pointing. Use '@' for your plain domain (e.g. coolexample.com). Don't input your domain name in this field (e.g. 'www', not 'www.coolexample.com'). -->
                  <th>Subdomain</th>

                  <!-- The destination of the record - the value varies based on the record type.
                This is optional as sometimes the value is dynamic or always changing -->
                  <th>Value</th>

                  <!-- Note for this particular record -->
                  <th>Note</th>

                  <!-- User who created this note -->
                  <th>Created By</th>

                  <th>Delete</th>
                </tr>

                <!-- Show all notes if there is no search input and no hostname in URL -->
                <template v-if="search_input === '' && !this.hostname">
                  <tr v-for="(note, i) in notes" :key="i">
                    <td>{{ note.provider }}</td>
                    <td>{{ note.domain }}</td>
                    <td>{{ note.type }}</td>
                    <td>{{ note.subdomain }}</td>
                    <td v-if="note.value">{{ note.value }}</td>
                    <td v-else><b>null</b></td>
                    <td>{{ note.note }}</td>
                    <td>{{ note.user }}</td>
                    <td>
                      <button
                        class="button is-light is-danger is-small"
                        @click="deleteNote(note.id)"
                      >
                        del
                      </button>
                    </td>
                  </tr>
                </template>

                <template v-else>
                  <tr v-for="({ item: note }, i) in results" :key="i">
                    <td>{{ note.provider }}</td>
                    <td>{{ note.domain }}</td>
                    <td>{{ note.type }}</td>
                    <td>{{ note.subdomain }}</td>
                    <td v-if="note.value">{{ note.value }}</td>
                    <td v-else><b>null</b></td>
                    <td>{{ note.note }}</td>
                    <td>{{ note.user }}</td>
                    <td>
                      <button
                        class="button is-light is-danger is-small"
                        @click="deleteNote(note.id)"
                      >
                        del
                      </button>
                    </td>
                  </tr>
                </template>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Fuse from "fuse.js";

export default {
  name: "ViewNotes",

  // This view is shareable, when shared, the URL contains a URL search `query` string, which will be the default search input
  // Hostname can be passed in to filter down to all DNS records from a specific provider
  props: ["query", "hostname"],

  data() {
    return {
      search_options: {
        keys: ["provider", "subdomain"],

        // When to give up search. A threshold of 0.0 requires a perfect match (of both letters and location), a threshold of 1.0 would match anything
        // Default: 0.6
        threshold: 0.7,
      },

      // Defaults to the URL `search` query string if there is any
      search_input: this.query || "",
    };
  },

  computed: {
    ...mapGetters(["notes"]),

    // Update fuse object when search options is updated
    fuse() {
      return new Fuse(Object.values(this.notes), this.search_options);
    },

    // Continously search as user input changes
    results() {
      return this.fuse.search(
        {
          $and: this.hostname
            ? this.search_input === ""
              ? [{ provider: this.hostname }]
              : [{ provider: this.hostname }, { subdomain: this.search_input }]
            : [{ subdomain: this.search_input }],
        },

        // @todo Let user set this limit
        // Limit max number of returned search results to ensure not too many results are returned (esp for lower spec mobile devices),
        // especially at the start of the search where alot of results will be matched when only 1 - 4 characters are entered
        { limit: 12 }
      );
    },
  },

  mounted() {
    // Run refresh method on mount everytime this page is loaded!
    this.refresh();
  },

  methods: {
    async refresh() {
      this.$store.commit("loading", true);
      await this.$store.dispatch("sync");
      this.$store.commit("loading", false);
    },

    // Clear the search input box and re-focus on the search field
    clearSearchInput() {
      this.search_input = "";
      this.$refs.searchField.focus();
    },

    async deleteNote(noteID) {
      this.$store.commit("loading", true);
      await this.$store.dispatch("deleteNote", noteID);
      this.$store.commit("loading", false);
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
