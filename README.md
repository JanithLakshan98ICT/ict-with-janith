# ICT with Janith — Premium ICT Learning Platform

Futuristic Grade 6–11 ICT website + Firebase student results system.

## Real result system
- Teacher/Admin login
- Create students with index number + password
- Create exams/assessments
- Enter marks
- Automatic grade: A >75, B >65, C >50, S >35, F ≤35
- Automatic rank: highest mark first; equal marks share the same rank
- Student login with index number + password
- Student can read only results linked to their own Firebase UID
- Publish notes, papers and announcements

## URLs
- Main site: `/`
- Student Portal: `/student.html`
- Teacher/Admin: `/admin/`

## Firebase
Follow `data/FIREBASE_SETUP.md` and paste the Web App config into `firebase/firebase-config.js`.
Never commit service-account JSON keys or other server secrets.


## New: Student Profiles + Birthday Wishes
- Student account includes profile photo and birthday.
- Admin can upload a JPG/PNG/WebP profile photo (max 3MB).
- Main website automatically shows a “Happy Birthday” post on the matching month/day.
- The public birthday directory stores month/day only (no birth year).
- Use student/guardian permission before publishing a child's photo publicly.

### Firebase Storage
Enable **Storage** in Firebase Console, then publish `data/FIREBASE_STORAGE_RULES.txt` under Storage → Rules.
Also update Firestore Rules using `data/FIREBASE_SECURITY_RULES.txt`.

### Admin URL
`/admin/` is now linked from the main navigation/footer.
