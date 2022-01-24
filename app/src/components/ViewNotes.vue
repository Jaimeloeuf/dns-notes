<template>
  <div class="px-5 py-5">
    <div class="columns is-multiline">
      <div class="column is-full">
        <p class="title is-3">Notes</p>
      </div>

      <div class="column is-full">
        <div class="card px-5">
          <div class="card-content content">
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
                <th>Name</th>

                <!-- The destination of the record - the value varies based on the record type.
                This is optional as sometimes the value is dynamic or always changing -->
                <th>Value</th>

                <!-- Note for this particular record -->
                <th>Note</th>
              </tr>

              <tr v-for="(note, i) in notes" :key="i">
                <td>{{ note.provider }}</td>
                <td>{{ note.domain }}</td>
                <td>{{ note.type }}</td>
                <td>{{ note.name }}</td>
                <td>{{ note.value ? note.value : "--NIL--" }}</td>
                <td>{{ note.note }}</td>
              </tr>
            </table>

            <button class="button is-light is-fullwidth" @click="loadMore">
              Load more
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

const isToday = (someDate, today = new Date()) =>
  someDate.getDate() == today.getDate() &&
  someDate.getMonth() == today.getMonth() &&
  someDate.getFullYear() == today.getFullYear();

export default {
  name: "ViewNotes",

  props: ["src"],

  computed: mapState(["notes"]),

  methods: {
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
};
</script>
