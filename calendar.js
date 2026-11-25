// Calendar page
import {requireLogin} from './firebase.js';
import {$,MONTHS,pad,today,parse,fmt,onDay,sortTasks,cardHTML,setupPage,onTasks} from './common.js';
setupPage('calendar');

let tasks=[];
let sel=new URLSearchParams(location.search).get('d')||today();   // selected day
let cal=parse(sel);                                                // month being shown

function render(){
  const y=cal.getFullYear(),m=cal.getMonth();
  $('title').textContent=MONTHS[m]+' '+y;
  let h=['S','M','T','W','T','F','S'].map(d=>`<div class="head">${d}</div>`).join('');
  const first=new Date(y,m,1).getDay(),len=new Date(y,m+1,0).getDate();
  for(let i=0;i<first;i++)h+='<button class="day blank"></button>';
  for(let d=1;d<=len;d++){
    const s=y+'-'+pad(m+1)+'-'+pad(d),ts=tasks.filter(t=>onDay(t,s));
    const dot=ts.length?(ts.every(t=>t.done)?'g':'r'):'';          // red = pending, green = all done
    h+=`<button class="day ${s===today()?'today':''} ${s===sel?'sel':''}" data-d="${s}">${d}${dot?`<i class="${dot}"></i>`:''}</button>`;
  }
  $('grid').innerHTML=h;
  const list=sortTasks(tasks.filter(t=>onDay(t,sel)));
  $('dayTitle').textContent=(sel===today()?'Today · ':'')+fmt(sel);
  $('dayList').innerHTML=list.length?list.map(cardHTML).join(''):'<div class="empty">No tasks on this day.</div>';
}
$('grid').onclick=e=>{const b=e.target.closest('[data-d]');if(b){sel=b.dataset.d;render()}};
$('prev').onclick=()=>{cal=new Date(cal.getFullYear(),cal.getMonth()-1,1);render()};
$('next').onclick=()=>{cal=new Date(cal.getFullYear(),cal.getMonth()+1,1);render()};
requireLogin(t=>{tasks=t;render();onTasks(t)});
