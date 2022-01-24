<template>
  <div id="overlay">
    <div id="loader">
      <p class="title is-4">... LOADING ...</p>
      <br />
      <div id="spinner" />
    </div>
  </div>
</template>

<script>
export default {
  name: "loader",
};
</script>

<style scoped>
#loader {
  /* Make everything in the loader stay in center */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /* Make the loader as a whole itself stay in the center and 'above' all other UI */
  z-index: 999;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* Transparent Overlay */
#overlay {
  z-index: 100;
  position: fixed;
  width: 100%;
  height: 100%;

  /* background: gray;
  opacity: 0.8; */

  /* Using the same background as the app to have a invisible layer on top of the app */
  /* Background image and ensure it's position is fixed */
  background: url("https://images.unsplash.com/photo-1542826522-beb53da5f648?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1934&q=80");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

#spinner {
  border: 0.3em solid #f3f3f3; /* Light grey */
  border-top: 0.3em solid #3498db; /* Blue */
  border-radius: 50%;
  width: 3em;
  height: 3em;
  animation: spin 1.6s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
