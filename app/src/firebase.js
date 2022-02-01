import { initializeApp } from "firebase/app";
import { getAuth, getIdToken, onAuthStateChanged } from "firebase/auth";

// firebaseConfig auto generated in project settings
const firebaseApp = initializeApp({
  apiKey: "AIzaSyBAjrx5cSEBgg-dAO_XmV7svMfd7XqkxNg",
  authDomain: "dns-notes.firebaseapp.com",
  projectId: "dns-notes",
  storageBucket: "dns-notes.appspot.com",
  messagingSenderId: "486890233536",
  appId: "1:486890233536:web:82bfbcd3485e92c5c59725",
});

const auth = getAuth(firebaseApp);

// Make firebase auth use browser's default language
auth.useDeviceLanguage();

/**
 * Only returns authentication header object if user is authenticated.
 * If user is unauthenticated, this does not throw and just returns undefined.
 * @function getAuthHeader
 * @returns {object | undefined} Authentication header object or nothing.
 */
async function getAuthHeader() {
  if (auth.currentUser)
    return { Authorization: `Bearer ${await getIdToken(auth.currentUser)}` };
}

// Export only the items that will be used
export { firebaseApp, auth, onAuthStateChanged, getAuthHeader };
