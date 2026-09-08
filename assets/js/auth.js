// Auth helpers shared by every page: sign-in, sign-out, and a route guard.
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { auth, googleProvider } from "./firebase-init.js";

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOutUser() {
  return signOut(auth);
}

/**
 * Call on every protected page. Runs `onReady(user)` once a signed-in user is
 * confirmed; redirects to index.html if nobody is signed in.
 */
export function requireAuth(onReady) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    onReady(user);
  });
}

/** Call on the sign-in page: if already signed in, skip straight to the dashboard. */
export function redirectIfSignedIn(destination = "dashboard.html") {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = destination;
  });
}
