// Add task page
import {requireLogin,addTask} from './firebase.js';
import {$,today,setupPage,onTasks} from './common.js';
setupPage('add');
$('start').value=today();

$('save').onclick=()=>{
  const name=$('name').value.trim(),start=$('start').value,end=$('end').value||start;
  $('err').className='err';
  if(!name){$('err').textContent='Please enter a task name.';return}
  if(!start){$('err').textContent='Please pick a start date.';return}
  if(end<start){$('err').textContent='The end date can’t be before the start date.';return}
  addTask({name,start,end,time:$('time').value,note:$('note').value.trim(),done:false})
    .catch(()=>alert('Could not save. Check your connection.'));
  $('err').className='err ok-msg';$('err').textContent='✓ Task saved';
  setTimeout(()=>location.href='calendar.html?d='+start,700);
};

// Add to home screen
let prompt=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e});
$('inst').onclick=()=>{
  if(prompt){prompt.prompt();prompt=null;return}
  alert(/iphone|ipad|ipod/i.test(navigator.userAgent)
    ?'On iPhone: tap the Share button in Safari, then “Add to Home Screen”.'
    :'On Android: tap the ⋮ menu in Chrome, then “Add to Home screen” (or “Install app”).');
};

// Reminders
$('notif').onclick=async()=>{
  try{const r=await Notification.requestPermission();$('notif').textContent=r==='granted'?'🔔 Reminders on':'Reminders blocked'}
  catch(e){$('notif').textContent='Not supported here'}
};

requireLogin(onTasks);
