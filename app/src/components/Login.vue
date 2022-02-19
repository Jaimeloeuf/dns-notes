<template>
  <div class="px-5 py-5" style="max-width: 36em">
    <div class="columns is-multiline box">
      <div class="column is-full">
        <p class="title is-3">Login</p>
        <div class="content">
          <ul>
            <li>Login with any OIDC provider to prove your email address.</li>
            <li>
              There is no 'signup' as you already need an account with any of
              the below login providers.
            </li>
          </ul>
        </div>
      </div>

      <div class="column is-full">
        <div class="columns is-multiline">
          <div class="column is-full">
            <button
              class="button is-fullwidth py-5 is-light is-success"
              @click="login_google"
            >
              Google Login
            </button>
          </div>

          <div class="column is-full">
            <button class="button is-fullwidth py-5 is-light">
              More coming soon!
            </button>
          </div>

          <!-- Possibly other OIDC login methods -->
          <!-- <div class="column is-full">
            <button
              class="button is-fullwidth py-5 is-light is-success"
              @click="login"
            >
              XXX Login
            </button>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default {
  name: "login",

  props: ["redirect"],

  methods: {
    async login_google() {
      try {
        // https://firebase.google.com/docs/auth/web/google-signin
        // Might add extra scope into Auth provider to get organization details
        const result = await signInWithPopup(
          getAuth(),
          new GoogleAuthProvider()
        );

        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;

        // This is the signed-in user's info
        // const user = result.user;

        // Get orgID, email and admin status from the JWT to set it into store
        const {
          claims: { org, email, admin },
        } = await result.user.getIdTokenResult();
        this.$store.commit("setter", ["org", org]);
        this.$store.commit("setter", ["email", email]);
        this.$store.commit("setter", ["admin", admin]);

        // Only trigger load all notes action to run in background if user belongs to an organization
        // Loading all notes again on login, because application state is wiped on logout.
        //
        // This API call might take a long time, and if user attempts to go ViewNotes API immediately,
        // There is a chance that the sync API might be called before this API resolves.
        // Which means that sync API will be called with lastSync time of 0, and get all events back
        // Which might cause data corruption if app attempts to apply sync events,
        // on the latest set of notes returned from this API call.
        // Thus to prevent this from happening, a full screen loader is used to prevent navigation until API resolves.
        // An alternative is to set a value in vuex, so sync action will wait fpr loadAllNotes action to complete.
        if (org) await this.$store.dispatch("withLoader", ["loadAllNotes"]);

        // Passing a to.fullPath as redirect string path to Vue router does not work, all query params is stripped off
        // if (this.redirect) this.$router.replace({ path: this.redirect });

        // Redirect to redirect route if any
        // Else if user already belong to an organization, redirect to home view
        // Else user is a new user without any organization, redirect to new user view
        if (this.redirect) this.$router.replace(JSON.parse(this.redirect));
        else if (org) this.$router.replace({ name: "home" });
        else this.$router.replace({ name: "new-user" });
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;

        // The email of the user's account used.
        const email = error.email;

        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);

        // @todo Handle error
      }
    },
  },
};
</script>
