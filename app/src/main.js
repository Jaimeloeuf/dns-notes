// import "bulma";
// Load bulma styles in the main entry point
import "bulma/css/bulma.min.css";

import { createApp } from "vue";
import router from "./router.js";
import store from "./store.js";
import App from "./App.vue";

createApp(App).use(router).use(store).mount("#app");
