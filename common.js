// Shared helpers + shared page pieces (brand header, bottom menu, task card).
import {toggleDone,removeTask,signOut,auth} from './firebase.js';

/* ===== TEXT YOU MAY WANT TO CHANGE ===== */
const BRAND={name:'ECO LAGOS',greeting:'Let’s keep the city greener today 🌿',logo:'icons/logo.png'};
const MENU=[['add','＋','Add'],['calendar','📅','Calendar'],['month','🗒️','Month']];

/* ===== Dates ===== */
export const $=id=>document.getElementById(id);
export const pad=n=>String(n).padStart(2,'0');
export const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
export const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
export const diff=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
export const today=()=>ymd(new Date());
export const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
export const fmt=s=>parse(s).toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const onDay=(t,d)=>t.start<=d&&d<=t.end;
export const sortTasks=a=>a.slice().sort((x,y)=>x.start.localeCompare(y.start)||(x.time||'99').localeCompare(y.time||'99'));

/* ===== Countdown text: returns [text, isGreen] ===== */
export function countdown(t){
  const n=today();
  if(t.done)return['Completed ✓',true];
  if(n>t.end){const k=diff(t.end,n);return['Overdue by '+k+(k>1?' days':' day'),false]}
  if(n<t.start)return['Starts in '+diff(n,t.start)+' d · due in '+diff(n,t.end)+' d',false];
  const k=diff(n,t.end);
  return[k===0?'Due today':k+(k>1?' days':' day')+' left',k>1];
}

/* ===== Task card (used by Calendar and Month pages) ===== */
export function cardHTML(t){
  const total=diff(t.start,t.end)+1;
  const dayNo=Math.min(Math.max(diff(t.start,today())+1,0),total);
  const [text,ok]=countdown(t);
  const range=t.start===t.end?fmt(t.start):fmt(t.start)+' → '+fmt(t.end);
  return `<div class="card ${t.done?'done':''}">
  <div class="card-top"><div><div class="name">${esc(t.name)}</div>
  <div class="meta">${range}${t.time?' · '+t.time:''}${total>1?' · day '+dayNo+' of '+total:''}</div></div>
  <div class="actions"><button class="icon-btn" data-done="${t.id}" data-state="${t.done?1:0}">${t.done?'↩':'✓'}</button><button class="icon-btn" data-del="${t.id}">🗑</button></div></div>
  ${t.note?'<div class="note">'+esc(t.note)+'</div>':''}
  <span class="badge ${ok?'ok':''}">${text}</span>
  ${total>1?'<div class="bar"><i style="width:'+Math.round(dayNo/total*100)+'%"></i></div>':''}</div>`;
}

/* ===== Call once at the top of every page ===== */
export function setupPage(page){
  if(page!=='login'){
    document.querySelector('main').insertAdjacentHTML('afterbegin','<div id="acct"><span id="who"></span><button class="icon-btn" id="logout">Log out</button></div>');
    $('logout').onclick=()=>signOut(auth);
  }
  if($('brand'))$('brand').outerHTML=`<div class="brand"><img alt="Logo" src="${BRAND.logo}"><h2>${BRAND.name}</h2><p>${BRAND.greeting}</p></div>`;
  if($('nav'))$('nav').innerHTML=MENU.map(([p,i,l])=>`<a href="${p}.html" class="${p===page?'on':''}"><b>${i}</b>${l}</a>`).join('');
  document.addEventListener('click',e=>{
    const d=e.target.closest('[data-done]');
    if(d)return void toggleDone(d.dataset.done,d.dataset.state==='1');
    const x=e.target.closest('[data-del]');
    if(x&&confirm('Delete this task?'))removeTask(x.dataset.del);
  });
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}

/* ===== Call whenever tasks load: "N tasks today" banner + notification ===== */
export function onTasks(tasks){
  const n=today(),list=tasks.filter(t=>!t.done&&onDay(t,n));
  if($('banner'))$('banner').innerHTML=list.length?`<div class="banner">🔔 You have ${list.length} task${list.length>1?'s':''} for today</div>`:'';
  try{
    if(!('Notification' in window)||Notification.permission!=='granted'||!list.length)return;
    if(localStorage.getItem('notified')===n)return;
    new Notification('Tasks for today',{body:list.map(t=>t.name+' ('+countdown(t)[0]+')').join('\n')});
    localStorage.setItem('notified',n);
  }catch(e){}
}
