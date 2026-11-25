// Firebase setup + login guard + task saving. Used by every page.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {initializeFirestore,persistentLocalCache,collection,doc,setDoc,getDoc,updateDoc,deleteDoc,onSnapshot} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {firebaseConfig} from '../firebase-config.js';

const app=initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=initializeFirestore(app,{localCache:persistentLocalCache()});
export {onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,doc,setDoc,getDoc};

const taskDoc=id=>doc(db,'users',auth.currentUser.uid,'tasks',id);
export const addTask=data=>setDoc(taskDoc(String(Date.now())),data);
export const toggleDone=(id,wasDone)=>updateDoc(taskDoc(id),{done:!wasDone});
export const removeTask=id=>deleteDoc(taskDoc(id));

// Call on every page except login. Sends the user to login if not signed in,
// otherwise shows the page and keeps `onTasks(tasks)` updated live.
export function requireLogin(onTasks){
  onAuthStateChanged(auth,async u=>{
    if(!u){location.href='login.html';return}
    try{const m=await getDoc(doc(db,'members',u.uid));if(!m.exists()){await signOut(auth);return}}catch(e){}
    document.body.classList.remove('boot');
    const who=document.getElementById('who');if(who)who.textContent=u.email;
    onSnapshot(collection(db,'users',u.uid,'tasks'),
      s=>onTasks(s.docs.map(d=>({...d.data(),id:d.id}))),()=>{});
  });
}
