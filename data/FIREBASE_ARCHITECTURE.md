# Firebase-ready architecture

## Collections

students/{indexNumber}
- name
- grade
- phone (optional)
- active
- createdAt

students/{indexNumber}/results/{resultId}
- assessment
- marks
- grade
- rank
- date

resources/{resourceId}
- title
- type: note | paper | practical
- grade
- url
- publishedAt

announcements/{announcementId}
- title
- body
- publishedAt
- active

## Security idea
Students should only read their own record. Admin writes students/results/resources/announcements.
For production, implement Firebase Authentication and Firestore Security Rules. Never put admin credentials or service-account keys in this GitHub repository.
