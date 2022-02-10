// import "bulma";
// Load bulma styles in the main entry point
import "bulma/css/bulma.min.css";
import { auth, onAuthStateChanged } from "./firebase";
import { oof } from "simpler-fetch";

// Set baseUrl before using in actions
oof._baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.dns-notes.enkeldigital.com"
    : "http://localhost:3000";

import { createApp } from "vue";
import router from "./router.js";
import store from "./store/index.js";
import App from "./App.vue";

// App variable to store reference to the vue App object
let app;

/**
 * Why new vue is wrapped in this?
 *
 * Wait for firebase to finish initialization before creating the app.
 * So that the router navigation wont break due to invalid auth
 */
const unsubscribe = onAuthStateChanged(auth, () => {
  // Prevent app initialization from running more than once
  if (!app)
    // Create new vue app
    app = createApp(App).use(router).use(store).mount("#app");

  // Use the firebase.Unsubscribe function returned from adding auth state change listner to unsubscribe
  // To prevent new Vue from running more than once
  unsubscribe();
});
