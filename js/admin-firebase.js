import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

import { app, db, storage, isFirebaseConfigured } from "../firebase/firebase-app.js";
import { firebaseConfig } from "../firebase/firebase-config.js";
import { studentEmail } from "../firebase/auth.js";

// Global Setup & Helpers
const creatorAuth = getAuth(initializeApp(firebaseConfig, 'studentCreator'));
const $ = id => document.getElementById(id);
let students = [], exams = [];

const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
}[c]));

const grade = m => m > 75 ? 'A' : m > 65 ? 'B' : m > 50 ? 'C' : m > 35 ? 'S' : 'F';

const msg = (m, t = 'info') => {
  const e = $('adminMessage');
  e.textContent = m;
  e.className = 'auth-message ' + t;
  e.hidden = false;
};

// Admin Validation
async function admin(uid) {
  const s = await getDoc(doc(db, 'admins', uid));
  return s.exists() && s.data().active === true;
}

// Data Loaders & Renderers
async function refresh() {
  const s = await getDocs(query(collection(db, 'students'), orderBy('name')));
  students = s.docs.map(d => ({ uid: d.id, ...d.data() }));
  $('studentCount').textContent = students.length;
  
  renderStudents();
  await loadExams();
  await loadResources();
  await loadAnnouncements();
  await loadBirthdayDirectory();
}

function renderStudents() {
  const q = ($('studentSearch').value \vert{}\vert{} '').toLowerCase();$('studentTable').innerHTML = students
    .filter(s => `${s.name} ${s.indexNumber} ${s.grade}`.toLowerCase().includes(q))
    .map(s => `<tr>
      <td><b>${esc(s.name)}</b></td>
      <td>${esc(s.indexNumber)}</td>
      <td>${esc(s.grade)}</td>
      <td><button class="mini-btn" data-del="${s.uid}">Delete</button></td>
    </tr>`)
    .join('') || '<tr><td colspan="4">No students.</td></tr>';

  document.querySelectorAll('[data-del]').forEach(b => {
    b.onclick = () => deleteStudent(b.dataset.del);
  });
}

async function loadExams() {
  const s = await getDocs(query(collection(db, 'exams'), orderBy('createdAt', 'desc')));
  exams = s.docs.map(d => ({ id: d.id, ...d.data() }));
  
  $('examSelect').innerHTML = exams
    .map(x => `<option value="${esc(x.id)}">${esc(x.name)} — ${esc(x.grade)}</option>`)
    .join('') || '<option value="">Create an exam first</option>';

  await renderMarks();
}

async function renderMarks() {
  const ex = exams.find(x => x.id === $('examSelect').value);
  if (!ex) {
    $('marksTable').innerHTML = '';
    return;
  }

  const s = await getDocs(query(collection(db, 'results'), where('examId', '==', ex.id)));
  const old = {};
  s.forEach(d => old[d.data().studentUid] = d.data());

  const list = students.filter(x => x.grade === ex.grade);
  $('marksTable').innerHTML = list.map(x => {
    const r = old[x.uid] || {};
    return `<tr>
      <td><b>${esc(x.name)}</b><small>${esc(x.indexNumber)}</small></td>
      <td><input class="mark-input" data-uid="${x.uid}" type="number" min="0" max="100" value="${r.marks ?? ''}"></td>
      <td data-g="${x.uid}">${r.grade || '—'}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="3">No students in this grade.</td></tr>';

  document.querySelectorAll('.mark-input').forEach(i => {
    i.oninput = () => {
      $(`[data-g="${i.dataset.uid}"]`).textContent = i.value === '' ? '—' : grade(Number(i.value));
    };
  });
}

async function deleteStudent(uid) {
  if (confirm('Student profile එක delete කරන්නද?')) {
    await deleteDoc(doc(db, 'students', uid));
    await refresh();
  }
}

async function loadBirthdayDirectory() {
  const s = await getDocs(query(collection(db, 'birthdayDirectory'), orderBy('monthDay')));
  $('birthdayAdminList').innerHTML = s.empty
    ? '<div class="empty-card">No birthday profiles yet.</div>'
    : s.docs.map(d => {
        const x = d.data();
        return `<div class="birthday-admin-card">
          <img src="${esc(x.photoUrl || '')}" alt="" onerror="this.style.display='none'">
          <div><b>${esc(x.name)}</b><small>${esc(x.grade)} • ${esc(x.monthDay)}</small></div>
        </div>`;
      }).join('');
}

async function loadResources() {
  const s = await getDocs(query(collection(db, 'resources'), orderBy('publishedAt', 'desc')));
  $('resourceTable').innerHTML = s.docs.map(d => {
    const x = d.data();
    return `<tr>
      <td>${esc(x.title)}</td>
      <td>${esc(x.grade)}</td>
      <td>${esc(x.type)}</td>
      <td>${x.active ? 'Published' : 'Hidden'}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="4">No resources.</td></tr>';
}

async function loadAnnouncements() {
  const s = await getDocs(query(collection(db, 'announcements'), orderBy('publishedAt', 'desc')));
  $('announcementTable').innerHTML = s.docs.map(d => 
    `<tr><td>${esc(d.data().title)}</td><td>${d.data().active ? 'Published' : 'Hidden'}</td></tr>`
  ).join('') || '<tr><td colspan="2">No announcements.</td></tr>';
}

// Event Listeners
$('adminLoginForm').onsubmit = async e => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(getAuth(app), $('adminEmail').value.trim(),$('adminPassword').value);
  } catch (err) {
    msg('Admin login failed.', 'error');
  }
};

$('adminLogout').onclick = () => signOut(getAuth(app));$('studentSearch').oninput = renderStudents;
$('examSelect').onchange = renderMarks;

$('studentForm').onsubmit = async e => {
  e.preventDefault();
  const n = $('sName').value.trim();
  const i = $('sIndex').value.trim().toUpperCase();
  const g = $('sGrade').value;
  const birthDate = $('sBirthDate').value;
  const p = $('sPassword').value;
  const photo = $('sPhoto').files[0];

  if (!n || !i || !birthDate || p.length < 6) {
    msg('Name, index, birthday සහ 6+ character password එකක් දෙන්න.', 'error');
    return;
  }

  if (photo && photo.size > 3 * 1024 * 1024) {
    msg('Photo එක 3MB ට අඩු එකක් තෝරන්න.', 'error');
    return;
  }

  try {
    $('createStudentBtn').disabled = true;
    const c = await createUserWithEmailAndPassword(creatorAuth, studentEmail(i), p);
    let photoUrl = '';

    if (photo) {
      const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase();
      const storageRef = ref(storage, `student-photos/${c.user.uid}/profile.${ext}`);
      await uploadBytes(storageRef, photo, { contentType: photo.type });
      photoUrl = await getDownloadURL(storageRef);
    }

    const monthDay = birthDate.slice(5);
    await setDoc(doc(db, 'students', c.user.uid), {
      name: n,
      indexNumber: i,
      grade: g,
      birthDate,
      monthDay,
      photoUrl,
      active: true,
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, 'birthdayDirectory', c.user.uid), {
      studentUid: c.user.uid,
      name: n,
      indexNumber: i,
      grade: g,
      monthDay,
      photoUrl,
      active: true
    });

    e.target.reset();
    msg(`Student ${i} created successfully with birthday profile.`, 'success');
    await refresh();
  } catch (err) {
    msg(err.code === 'auth/email-already-in-use' ? 'Index number already exists.' : err.message, 'error');
  } finally {
    $('createStudentBtn').disabled = false;
  }
};

$('examForm').onsubmit = async e => {
  e.preventDefault();
  await setDoc(doc(db, 'exams', 'exam_' + Date.now()), {
    name: $('examName').value.trim(),
    grade: $('examGrade').value,
    createdAt: serverTimestamp()
  });
  e.target.reset();
  msg('Exam created.', 'success');
  await loadExams();
};

$('saveMarksBtn').onclick = async () => {
  const ex = exams.find(x => x.id === $('examSelect').value);
  if (!ex) return;

  const rows = [...document.querySelectorAll('.mark-input')]
    .filter(x => x.value !== '')
    .map(x => ({ uid: x.dataset.uid, marks: Number(x.value) }));

  const rank = [...rows].sort((a, b) => b.marks - a.marks);
  const rankMap = new Map();
  
  rank.forEach((x, i) => {
    if (!rankMap.has(x.marks)) rankMap.set(x.marks, i + 1);
  });

  const b = writeBatch(db);
  rows.forEach(x => {
    const s = students.find(a => a.uid === x.uid);
    b.set(
      doc(db, 'results', `${ex.id}_${x.uid}`),
      {
        studentUid: x.uid,
        indexNumber: s.indexNumber,
        studentName: s.name,
        gradeLevel: s.grade,
        examId: ex.id,
        examName: ex.name,
        assessment: ex.name,
        marks: x.marks,
        percentage: x.marks,
        grade: grade(x.marks),
        pass: x.marks > 35,
        rank: rankMap.get(x.marks),
        totalStudents: rows.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  });

  await b.commit();
  msg(`${rows.length} students: grade + rank automatically calculated.`, 'success');
  await renderMarks();
};

$('resourceForm').onsubmit = async e => {
  e.preventDefault();
  await setDoc(doc(collection(db, 'resources')), {
    title: $('rTitle').value.trim(),
    grade: $('rGrade').value,
    type: $('rType').value,
    url: $('rUrl').value.trim(),
    active: true,
    publishedAt: serverTimestamp()
  });
  e.target.reset();
  msg('Resource published.', 'success');
  await loadResources();
};

$('announcementForm').onsubmit = async e => {
  e.preventDefault();
  await setDoc(doc(collection(db, 'announcements')), {
    title: $('aTitle').value.trim(),
    body: $('aBody').value.trim(),
    active: true,
    publishedAt: serverTimestamp()
  });
  e.target.reset();
  msg('Announcement published.', 'success');
  await loadAnnouncements();
};

// Initial State & Auth Listener
$('adminLogin').hidden = true;
$('adminApp').hidden = true;

if (!isFirebaseConfigured) {
  $('adminLogin').hidden = false;
  msg('Firebase config missing. firebase/firebase-config.js update කරන්න.', 'warn');
} else {
  onAuthStateChanged(getAuth(app), async u => {
    if (!u) {
      $('adminApp').hidden = true;
      $('adminLogin').hidden = false;
      return;
    }

    $('adminLogin').hidden = true;
    $('adminApp').hidden = true;

    try {
      if (await admin(u.uid)) {
        $('adminApp').hidden = false;
        await refresh();
      } else {
        await signOut(getAuth(app));
        $('adminLogin').hidden = false;
        msg('මෙම account එකට Admin access නැහැ.', 'error');
      }
    } 
catch(err) {
  $('adminApp').hidden = true;
  $('adminLogin').hidden = false;

  console.error('Admin dashboard error:', err.code, err.message);

  msg(
    `Dashboard error: ${err.code || 'unknown'} — ${err.message || 'Unknown error'}`,
    'error'
  );
}

  });
}
