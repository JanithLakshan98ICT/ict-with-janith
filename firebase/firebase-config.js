export const firebaseConfig = {
  apiKey: "AIzaSyBYWJ9hBzNzsdGKGjX4hydlR-UrTDDAX0A",
  authDomain: "ict-with-janith.firebaseapp.com",
  projectId: "ict-with-janith",
  storageBucket: "ict-with-janith.firebasestorage.app",
  messagingSenderId: "589286410493",
  appId: "1:589286410493:web:f8c89a79b1308ef0045694"
};
export const isFirebaseConfigured = !Object.values(firebaseConfig).some(v => String(v).includes("YOUR_"));
