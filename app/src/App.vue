<script setup>
import Loader from "./components/Loader.vue";
</script>

<template>
  <div>
    <!-- Conditionally show the loader based on the shared global loading flag -->
    <Loader v-if="$store.state.loading" />
    <router-view class="container" style="max-width: 36em" />
  </div>
</template>

<style>
html {
  /* background: linear-gradient(#e66465, #9198e5); */

  /* fallback for old browsers */
  background: #bdc3c7;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(to right, #2c3e50, #a6a8a8);

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(to right, #2c3e50, #a6a8a8);

  /* Background image below now overrides the above gradient */

  /* Background image and ensure it's position is fixed */
  background: url("https://images.unsplash.com/photo-1542826522-beb53da5f648?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1934&q=80");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Color input pink if it is invalid --> e.g. when telephone number does not match the specified pattern */
/* Will only activate if the placeholder is not currently being shown, meaning will not show before user type anything */
input:not(:placeholder-shown):invalid {
  background-color: lightpink;
}

/* Shared style class used by Cancel.vue and Reschedule.vue */
.centered {
  display: flex;
  height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: center;
}
</style>
