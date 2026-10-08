import {collection,query,where,getDocs} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {db} from "../firebase/firebase-app.js";
const esc=v=>String(v??'').replace(/[&<>\'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const today=new Date();
const monthDay=`${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
async function loadBirthdays(){
  const section=document.getElementById('birthdays'); const grid=document.getElementById('birthdayGrid');
  if(!section||!grid)return;
  try{
    const snap=await getDocs(query(collection(db,'birthdayDirectory'),where('monthDay','==',monthDay)));
    if(snap.empty){section.hidden=true;return;}
    section.hidden=false;
    grid.innerHTML=snap.docs.map(d=>d.data()).filter(x=>x.active!==false).map(x=>{return `<article class="birthday-card reveal"><div class="birthday-photo-wrap"><img src="${esc(x.photoUrl||'')}" alt="${esc(x.name)}" onerror="this.style.display='none'"><span>🎂</span></div><div class="birthday-copy"><div class="birthday-kicker">TODAY'S BIRTHDAY</div><h3>${esc(x.name)}</h3><p>${esc(x.grade)} • ${esc(x.indexNumber)}</p><div class="birthday-wish">සුභ උපන්දිනයක්! 🎉<br><small>ICT with ජනිත් වෙතින් ආදරණීය සුභ පැතුම්.</small></div></div></article>`}).join('');
    requestAnimationFrame(()=>grid.querySelectorAll('.reveal').forEach(x=>x.classList.add('visible')));
  }catch(e){section.hidden=true;console.warn('Birthday feed unavailable',e)}
}
loadBirthdays();
