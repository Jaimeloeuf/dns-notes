import router from "../router.js";
import store from "../store.js";
import { auth } from "../firebase.js";

export default async function logout() {
  if (!confirm("Logout?")) return;

  // Clear everything in vuex state by resetting it to its default state
  // Clearing this will also trigger plugin to clear all persisted state
  // All data needs to be cleared so if another user logins they do not inherit any state
  store.commit("reset");

  // Erase any data left in localStorage first before logging out with firebase auth
  localStorage.clear();

  // Signout current user
  auth.signOut();

  // Redirect to login view
  router.push({ name: "login" });
}
