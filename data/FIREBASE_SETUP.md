# Firebase setup — ICT with Janith

1. Create a Firebase project at https://console.firebase.google.com/.
2. Add a Web App and copy its config into `firebase/firebase-config.js`.
3. Authentication → Sign-in method → enable Email/Password.
4. Firestore Database → Create database.
5. Authentication → Users → Add the teacher/admin email and password. Copy its UID.
6. Firestore → create collection `admins`, document ID = that UID, field `active` = Boolean `true`.
7. Copy `data/FIREBASE_SECURITY_RULES.txt` into Firestore → Rules and Publish.

## Workflow
Teacher/Admin → Create Student → Create Exam → Enter Marks → Save → automatic grade + rank → Student Login → own results only.

Student login is Index Number + Password. Behind the scenes an internal Firebase Auth email is generated from the index number; students do not need to know it.

Grade rules: A >75; B >65 to 75; C >50 to 65; S >35 to 50; F ≤35.

Ranks are highest-first. Equal marks share the same rank (1, 2, 2, 4).

Never upload Firebase service-account JSON keys or other server secrets to GitHub.
