<template>
  <div class="columns">
    <div class="column is-half">
      <router-link class="button is-fullwidth" :to="{ name: 'view' }">
        View all notes
      </router-link>
    </div>

    <div class="column is-half">
      <router-link class="button is-fullwidth" :to="{ name: 'create' }">
        Create note
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>
