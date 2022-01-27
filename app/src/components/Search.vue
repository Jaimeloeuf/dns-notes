<template>
  <div class="px-5 py-5">
    <div class="columns is-multiline">
      <div class="column">
        <p class="title is-3">Search</p>
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
            <div v-if="search_input !== '' && results.length === 0">
              No notes match your search input
            </div>

            <div v-else>
              <p class="subtitle is-4">Select to edit</p>

              <table>
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
                </tr>

                <template v-if="search_input === ''">
                  <tr v-for="(note, i) in notes" :key="i">
                    <td>{{ note.provider }}</td>
                    <td>{{ note.domain }}</td>
                    <td>{{ note.type }}</td>
                    <td>{{ note.subdomain }}</td>
                    <td v-if="note.value">{{ note.value }}</td>
                    <td v-else><b>null</b></td>
                    <td>{{ note.note }}</td>
                    <td>{{ note.user }}</td>
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
                  </tr>
                </template>
              </table>

              <button class="button is-light is-fullwidth" @click="loadMore">
                Load more
              </button>
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

const isToday = (someDate, today = new Date()) =>
  someDate.getDate() == today.getDate() &&
  someDate.getMonth() == today.getMonth() &&
  someDate.getFullYear() == today.getFullYear();

export default {
  name: "Search",

  // This search view is shareable, when shared, the URL contains a URL search `query` string, which will be the default search input
  props: ["query"],

  data() {
    return {
      search_options: {
        // @todo Can be user edited
        keys: ["subdomain"],

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
      // Limit max number of returned search results to ensure not too many results are returned (esp for lower spec mobile devices),
      // especially at the start of the search where alot of results will be matched when only 1 - 4 characters are entered
      return this.fuse.search(this.search_input, { limit: 12 });
    },
  },

  methods: {
    // Clear the search input box and re-focus on the search field
    clearSearchInput() {
      this.search_input = "";
      this.$refs.searchField.focus();
    },

    async loadDates(after) {
      this.$store.commit("loading", true);
      await this.$store.dispatch("loadDates", after);
      this.$store.commit("loading", false);
    },

    async loadMore() {
      this.loadDates(
        // Get the last date in available dates to get more timeslots after that date
        // SADLY SAFARI does not support .at() ... smh
        // state.datesAvailable.at(-1)?.date,
        this.$store.state.datesAvailable[
          this.$store.state.datesAvailable.length - 1
        ]?.date
      );
    },

    toWeekday(i, date) {
      // If this is the first available date, check if it is today
      // Only check if it is the first available date to prevent doing extra work checking the other further dates
      return i === 0 && isToday(date)
        ? "Today"
        : date.toLocaleString("default", { weekday: "long" });
    },

    selectDate(date) {
      // this.$store.commit("setter", ["selectedDate", date]);
      // this.$router.push({ name: "select-timeslot" });
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
