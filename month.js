// Month list page
import {requireLogin} from './firebase.js';
import {$,MONTHS,pad,sortTasks,cardHTML,setupPage,onTasks} from './common.js';
setupPage('month');

let tasks=[],cur=new Date();
function render(){
  const y=cur.getFullYear(),m=cur.getMonth();
  $('title').textContent=MONTHS[m]+' '+y;
  const first=y+'-'+pad(m+1)+'-01',last=y+'-'+pad(m+1)+'-'+pad(new Date(y,m+1,0).getDate());
  const list=sortTasks(tasks.filter(t=>t.start<=last&&t.end>=first));
  const left=list.filter(t=>!t.done).length;
  $('summary').textContent=list.length?`${list.length} task${list.length>1?'s':''} · ${left} still to do`:'';
  $('list').innerHTML=list.length?list.map(cardHTML).join(''):'<div class="empty">No tasks this month.</div>';
}
$('prev').onclick=()=>{cur=new Date(cur.getFullYear(),cur.getMonth()-1,1);render()};
$('next').onclick=()=>{cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);render()};
requireLogin(t=>{tasks=t;render();onTasks(t)});
