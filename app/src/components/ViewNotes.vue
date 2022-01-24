<template>
  <div class="px-5 py-5">
    <div class="columns is-multiline">
      <div class="column is-full">
        <p class="title is-3">Book a viewing slot!</p>
      </div>

      <div class="column is-full">
        <div class="card px-5">
          <div class="card-content content">
            <p class="subtitle is-4">Select a date</p>

            <div v-for="(date, i) in datesAvailable" :key="i">
              <div
                class="level is-mobile my-4"
                style="cursor: pointer"
                @click="selectDate(date)"
              >
                <div class="level-left">
                  <div class="level-item">
                    {{ toWeekday(i, new Date(date.date)) }}
                  </div>
                </div>

                <div class="level-right">
                  <div class="level-item">
                    {{ new Date(date.date).getDate() }}

                    {{
                      new Date(date.date).toLocaleString("default", {
                        month: "long",
                      })
                    }}
                  </div>
                </div>
              </div>

              <!-- @todo Why is the HR alternating in boldness? -->
              <hr style="background-color: #dedede" />
            </div>

            <button class="button is-light is-fullwidth" @click="getMoreDates">
              See More Available Dates
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
  name: "Booking",

  props: ["src"],

  computed: mapState(["datesAvailable"]),

  methods: {
    async loadDates(after) {
      this.$store.commit("loading", true);
      await this.$store.dispatch("loadDates", after);
      this.$store.commit("loading", false);
    },

    async getMoreDates() {
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
      this.$store.commit("setter", ["selectedDate", date]);
      this.$router.push({ name: "select-timeslot" });
    },
  },
};
</script>
