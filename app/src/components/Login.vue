<template>
  <div class="px-5 py-5" style="max-width: 36em">
    <div class="columns is-multiline box">
      <div class="column is-full">
        <p class="title is-3">Login</p>
      </div>

      <div class="column is-full">
        <div class="columns is-multiline">
          <div class="column is-narrow">
            <button class="button is-fullwidth py-5" @click="$router.back">
              Sign up
            </button>
          </div>

          <div class="column">
            <button
              class="button is-fullwidth py-5 is-light is-success"
              @click="login"
            >
              Google Login
            </button>
          </div>
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
    async login() {
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

        // Get orgID and admin status from the JWT to set it into store
        const {
          claims: { org, admin },
        } = await result.user.getIdTokenResult();
        this.$store.commit("setter", ["org", org]);
        this.$store.commit("setter", ["admin", admin]);

        // Passing a to.fullPath as redirect string path to Vue router does not work, all query params is stripped off
        // if (this.redirect) this.$router.replace({ path: this.redirect });

        // Redirect to home view if there is no redirect route passed in
        if (this.redirect) this.$router.replace(JSON.parse(this.redirect));
        else this.$router.replace({ name: "home" });
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
