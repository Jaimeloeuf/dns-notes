import { auth, getAuthHeader } from "../../firebase.js";
import { oof } from "simpler-fetch";

import router from "../../router.js";

import { errorHandlingWrapper } from "../utils.js";

/**
 * Vuex action to delete their account from firebase auth
 */
export default errorHandlingWrapper(async function delAcc({ commit }) {
  const res = await oof
    .POST("/user/account/delete")
    .header(await getAuthHeader())
    .runJSON();

  if (!res.ok) throw new Error(res.error);

  // Since user deleted their account, delete all data in vuex and localStorage
  commit("reset");
  localStorage.clear();

  await auth.signOut();

  // Redirect to login view
  router.push({ name: "login" });
});
