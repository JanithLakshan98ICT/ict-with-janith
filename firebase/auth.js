import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth } from "./firebase-app.js";
export const studentEmail = index => `${String(index).trim().toLowerCase()}@student.ictwithjanith.local`;
export const loginWithIndex = (index,password) => signInWithEmailAndPassword(auth,studentEmail(index),password);
export const logout = () => signOut(auth);
export const watchAuth = cb => onAuthStateChanged(auth,cb);
