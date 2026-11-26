// Login / Sign up page
import {auth,db,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,doc,setDoc,getDoc} from './firebase.js';
import {$,setupPage} from './common.js';
setupPage('login');

let mode='in',signingUp=false;
function setMode(m){
  mode=m;
  $('tIn').classList.toggle('on',m==='in');
  $('tUp').classList.toggle('on',m==='up');
  $('codeW').hidden=m!=='up';
  $('go').textContent=m==='up'?'Create account':'Log in';
  $('aerr').textContent='';
}
$('tIn').onclick=()=>setMode('in');
$('tUp').onclick=()=>setMode('up');

const messages={
  'auth/invalid-credential':'Wrong email or password.',
  'auth/email-already-in-use':'That email already has an account. Log in instead.',
  'auth/weak-password':'Password must be at least 6 characters.',
  'auth/invalid-email':'Please enter a valid email.',
  'auth/too-many-requests':'Too many attempts. Try again later.'
};

$('go').onclick=async()=>{
  const em=$('em').value.trim(),pw=$('pw').value,code=$('code').value.trim();
  $('aerr').textContent='';
  if(!em||!pw){$('aerr').textContent='Enter your email and password.';return}
  if(mode==='up'&&!code){$('aerr').textContent='Enter the access code.';return}
  $('go').disabled=true;
  try{
    if(mode==='in'){await signInWithEmailAndPassword(auth,em,pw)}   // redirect handled below
    else{
      signingUp=true;
      const c=await createUserWithEmailAndPassword(auth,em,pw);
      try{await setDoc(doc(db,'members',c.user.uid),{email:em,code})}  // Firestore checks the code
      catch(e){
  console.error('Membership creation failed:', e.code, e.message);
  await c.user.delete();
  throw e;
}
      location.href='add.html';
    }
  }catch(e){$('aerr').textContent=e.code==='bad-code'?'Invalid access code.':(messages[e.code]||'Something went wrong. Please try again.')}
  finally{signingUp=false;$('go').disabled=false}
};

// If already signed in (and a member), skip straight to the app.
onAuthStateChanged(auth,async u=>{
  document.body.classList.remove('boot');
  if(!u||signingUp)return;
  try{
    const m=await getDoc(doc(db,'members',u.uid));
    if(!m.exists()){await signOut(auth);$('aerr').textContent='This account has no access.';return}
  }catch(e){}
  location.href='add.html';
});
