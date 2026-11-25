import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
import { initTaskSetup } from './task-setup.js';
import { createCalendar } from './calendar.js';
import { createMonthTasks } from './month-tasks.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, { localCache: persistentLocalCache() });
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parse = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const diff = (a,b) => Math.round((parse(b) - parse(a)) / 864e5);
const today = () => ymd(new Date());
const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmt = s => parse(s).toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short' });
const onDay = (t,d) => t.start <= d && d <= t.end;
const esc = s => String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let uid = null, unsub = null, signingUp = false, taskData = [];
const tasks = () => taskData;
const sortT = a => a.slice().sort((x,y) => (x.time || '99').localeCompare(y.time || '99') || x.start.localeCompare(y.start));

function countdown(t) {
  const n = today();
  if (t.done) return ['Completed ✓', 1];
  if (n > t.end) { const k = diff(t.end,n); return ['Overdue by ' + k + (k > 1 ? ' days' : ' day'), 0]; }
  if (n < t.start) return ['Starts in ' + diff(n,t.start) + ' d · due in ' + diff(n,t.end) + ' d', 0];
  const k = diff(n,t.end);
  return [k === 0 ? 'Due today' : k + (k > 1 ? ' days' : ' day') + ' left', k > 1 ? 1 : 0];
}
function card(t) {
  const total = diff(t.start,t.end) + 1;
  const dayNo = Math.min(Math.max(diff(t.start,today()) + 1,0),total);
  const [label,ok] = countdown(t);
  const range = t.start === t.end ? fmt(t.start) : fmt(t.start) + ' → ' + fmt(t.end);
  return `<div class="card ${t.done ? 'done' : ''}"><div class="top"><div><div class="nm">${esc(t.name)}</div><div class="meta">${range}${t.time ? ' · ' + esc(t.time) : ''}${total > 1 ? ' · day ' + dayNo + ' of ' + total : ''}</div></div><div class="act"><button class="ic" data-done="${esc(t.id)}">${t.done ? '↩' : '✓'}</button><button class="ic" data-del="${esc(t.id)}">🗑</button></div></div>${t.note ? '<div class="note">' + esc(t.note) + '</div>' : ''}<span class="badge ${ok ? 'ok' : ''}">${label}</span>${total > 1 ? '<div class="bar"><i style="width:' + Math.round(dayNo/total*100) + '%"></i></div>' : ''}</div>`;
}
const ctx = { $, db, doc, setDoc, today, parse, show, setSelection: (day,date) => { calendar.setSelection(day,date); monthView.setMonth(date); } };
const calendar = createCalendar({ $, tasks, sortT, onDay, today, pad, MN, fmt, card });
const monthView = createMonthTasks({ $, tasks, sortT, MN, pad, card });
ctx.show = show;
initTaskSetup(ctx);

function renderBanner() {
  const count = tasks().filter(t => !t.done && onDay(t,today())).length;
  $('banner').innerHTML = count ? `<div class="banner">🔔 You have ${count} task${count > 1 ? 's' : ''} for today</div>` : '';
}
function renderAll() { renderBanner(); calendar.render(); monthView.render(); }
function show(page) {
  document.querySelectorAll('.page').forEach(el => el.classList.toggle('on', el.id === 'p-' + page));
  document.querySelectorAll('.tabs button').forEach(el => el.classList.toggle('on', el.dataset.p === page));
  $('brand').style.display = page === 'cal' ? 'none' : 'block';
  renderAll(); window.scrollTo(0,0);
}
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => show(b.dataset.p));
document.addEventListener('click', async event => {
  const day = event.target.closest('[data-d]');
  if (day) { calendar.select(day.dataset.d); return; }
  const done = event.target.closest('[data-done]');
  if (done) { const task = tasks().find(t => t.id === done.dataset.done); if (task && uid) await updateDoc(doc(db,'users',uid,'tasks',task.id),{done:!task.done}); return; }
  const remove = event.target.closest('[data-del]');
  if (remove && uid && confirm('Delete this task?')) await deleteDoc(doc(db,'users',uid,'tasks',remove.dataset.del));
});

function remind() {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const n = today(); if (localStorage.getItem('notified') === n) return;
    const list = tasks().filter(t => !t.done && onDay(t,n));
    if (list.length) { new Notification('Tasks for today', { body:list.map(t => t.name + ' (' + countdown(t)[0] + ')').join('\n') }); localStorage.setItem('notified',n); }
  } catch (_) {}
}
$('notif').onclick = async () => {
  try { const result = await Notification.requestPermission(); $('notif').textContent = result === 'granted' ? '🔔 Reminders on' : 'Reminders blocked'; remind(); }
  catch (_) { $('notif').textContent = 'Not supported here'; }
};
let installPrompt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });
$('inst').onclick = async () => {
  if (installPrompt) { installPrompt.prompt(); installPrompt = null; return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  alert(ios ? 'On iPhone: tap Share in Safari, then “Add to Home Screen”.' : 'On Android: tap the ⋮ menu in Chrome, then “Add to Home screen” or “Install app”.');
};

let mode = 'in';
function setMode(value) { mode = value; $('tIn').classList.toggle('on',value === 'in'); $('tUp').classList.toggle('on',value === 'up'); $('codeW').style.display = value === 'up' ? 'block' : 'none'; $('go').textContent = value === 'up' ? 'Create account' : 'Log in'; $('aerr').textContent = ''; }
$('tIn').onclick = () => setMode('in'); $('tUp').onclick = () => setMode('up');
const errorMessage = e => ({'auth/invalid-credential':'Wrong email or password.','auth/email-already-in-use':'That email already has an account. Log in instead.','auth/weak-password':'Password must be at least 6 characters.','auth/invalid-email':'Please enter a valid email.','auth/too-many-requests':'Too many attempts. Try again later.','bad-code':'Invalid access code.'}[e.code] || 'Something went wrong. Please try again.');
async function enter(user) {
  try {
    const member = await getDoc(doc(db,'members',user.uid));
    if (!member.exists()) { await signOut(auth); $('aerr').textContent = 'This account has no access.'; return; }
  } catch (e) { $('aerr').textContent = 'Could not verify membership. Check Firestore rules and connection.'; await signOut(auth); return; }
  uid = user.uid; if (unsub) unsub();
  unsub = onSnapshot(collection(db,'users',uid,'tasks'), snap => { taskData = snap.docs.map(d => ({...d.data(),id:d.id})); renderAll(); remind(); }, () => { $('banner').textContent = 'Could not load tasks. Check Firestore permissions.'; });
  $('who').textContent = user.email || ''; document.body.classList.remove('out'); show('add');
}
function leave() { if (unsub) unsub(); unsub = null; uid = null; taskData = []; document.body.classList.add('out'); $('brand').style.display = 'block'; }
$('go').onclick = async () => {
  const email = $('em').value.trim(), password = $('pw').value, code = $('code').value.trim(); $('aerr').textContent = '';
  if (!email || !password) { $('aerr').textContent = 'Enter your email and password.'; return; }
  if (mode === 'up' && !code) { $('aerr').textContent = 'Enter the access code.'; return; }
  $('go').disabled = true;
  try {
    if (mode === 'in') await signInWithEmailAndPassword(auth,email,password);
    else {
      signingUp = true;
      const credential = await createUserWithEmailAndPassword(auth,email,password);
      try { await setDoc(doc(db,'members',credential.user.uid), { email, code }); }
      catch (e) { await credential.user.delete(); throw { code:'bad-code' }; }
      signingUp = false; await enter(credential.user);
    }
  } catch (e) { $('aerr').textContent = errorMessage(e); }
  finally { signingUp = false; $('go').disabled = false; }
};
$('logout').onclick = () => signOut(auth);
onAuthStateChanged(auth,user => { document.body.classList.remove('boot'); if (signingUp) return; user ? enter(user) : leave(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
setInterval(() => { renderAll(); remind(); },60000);
