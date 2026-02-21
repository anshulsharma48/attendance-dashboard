import React, { useEffect, useState } from "react";
import "./index.css";

import { auth, db, storage } from "./firebase";

import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function App(){

  const [user,setUser]=useState(undefined);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const [profile,setProfile]=useState({name:"",photo:""});
  const [subjects,setSubjects]=useState({});
  const [bulk,setBulk]=useState("");

  const [editing,setEditing]=useState(false);
  const [preview,setPreview]=useState({});

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // ⭐ Aggregate attendance
  const aggregateAttendance = () => {
    const list = Object.values(subjects).filter(s => s.total > 0);
    if(list.length===0) return 0;

    let sum=0;
    list.forEach(s=>{
      sum += (s.attended/s.total)*100;
    });

    return (sum/list.length).toFixed(1);
  };

  const safeBunk = (attended,total) => {
    if(total===0) return 0;
    let bunk=0;
    while((attended/(total+bunk))>=0.75){
      bunk++;
    }
    return bunk-1;
  };

  useEffect(()=>{
    return onAuthStateChanged(auth, async u=>{
      if(u){
        setUser(u);
        await loadUser(u.uid);
      }else setUser(null);
    });
  },[]);

  const loadUser = async(uid)=>{
    const snap = await getDoc(doc(db,"users",uid));
    if(snap.exists()){
      setProfile({name:snap.data().name||"",photo:snap.data().photo||""});
      setSubjects(snap.data().subjects||{});
    }
  };

  const saveUser = async(updatedSubjects=subjects,updatedProfile=profile)=>{
    await setDoc(doc(db,"users",user.uid),{
      name:updatedProfile.name,
      photo:updatedProfile.photo,
      subjects:updatedSubjects
    });
    setSubjects(updatedSubjects);
    setProfile(updatedProfile);
  };

  const login = async ()=>{
    try{ await signInWithEmailAndPassword(auth,email,password); }
    catch(e){ alert(e.message); }
  };

  const signup = async ()=>{
    try{
      const res = await createUserWithEmailAndPassword(auth,email,password);
      await setDoc(doc(db,"users",res.user.uid),{name:"",photo:"",subjects:{}});
    }catch(e){ alert(e.message); }
  };

  const logout = ()=> signOut(auth);

  const uploadPhoto = async e=>{
    const file=e.target.files[0];
    if(!file) return;
    const storageRef = ref(storage,`profiles/${user.uid}`);
    await uploadBytes(storageRef,file);
    const url = await getDownloadURL(storageRef);
    saveUser(subjects,{...profile,photo:url});
  };

  const addBulk=()=>{
    const list=bulk.split("\n").filter(Boolean);
    const copy={...subjects};
    list.forEach(s=>{
      if(!copy[s]) copy[s]={attended:0,total:0,history:[]};
    });
    saveUser(copy);
    setBulk("");
  };

  const mark=(name,present)=>{
    const copy={...subjects};
    copy[name].total++;
    if(present) copy[name].attended++;
    copy[name].history.push(present);
    saveUser(copy);
  };

  const undo=name=>{
    const copy={...subjects};
    const last=copy[name].history.pop();
    if(last!==undefined){
      copy[name].total--;
      if(last) copy[name].attended--;
    }
    saveUser(copy);
  };

  const previewAttend = (name)=>{
    const s = subjects[name];
    const pct = ((s.attended+1)/(s.total+1))*100;
    setPreview({...preview,[name]:`If attend → ${pct.toFixed(1)}%`});
  };

  const previewMiss = (name)=>{
    const s = subjects[name];
    const pct = (s.attended/(s.total+1))*100;
    setPreview({...preview,[name]:`If miss → ${pct.toFixed(1)}%`});
  };

  if(user===undefined) return <div style={{padding:40}}>Loading…</div>;

  if(!user){
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Attendance Tracker</h2>
          <input placeholder="Email" onChange={e=>setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
          <button onClick={signup}>Create account</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">

      <div className="header">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {profile.photo && <img src={profile.photo} className="avatar" alt="" />}
          <div>
            <strong>{getGreeting()}, {profile.name||user.email}</strong>
            <div>📊 Aggregate Attendance: {aggregateAttendance()}%</div>
          </div>
        </div>

        <div>
          <button onClick={()=>setEditing(!editing)}>Edit Profile</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {editing && (
        <div className="card">
          <input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/>
          <input type="file" accept="image/png,image/jpeg" onChange={uploadPhoto}/>
          <button onClick={()=>saveUser()}>Save</button>
        </div>
      )}

      <div className="card">
        <textarea value={bulk} onChange={e=>setBulk(e.target.value)} placeholder="Bulk subjects"/>
        <button onClick={addBulk}>Add Subjects</button>
      </div>

      {Object.keys(subjects).map(name=>{
        const s=subjects[name];
        const pct=s.total?((s.attended/s.total)*100).toFixed(1):0;

        return (
          <div key={name} className="card">
            <h3>{name}</h3>
            <div>{s.attended}/{s.total} — {pct}%</div>

            <div style={{fontSize:13,color:"#555"}}>
              {safeBunk(s.attended,s.total)>0
                ? `You can miss ${safeBunk(s.attended,s.total)} classes safely`
                : "You must attend upcoming classes"}
            </div>

            {preview[name] && (
              <div style={{marginTop:6,fontSize:13,color:"#2563eb"}}>
                {preview[name]}
              </div>
            )}

            <button onClick={()=>previewAttend(name)}>Preview Attend</button>
            <button onClick={()=>previewMiss(name)}>Preview Miss</button>

            <button onClick={()=>mark(name,true)}>Present</button>
            <button onClick={()=>mark(name,false)}>Absent</button>
            <button onClick={()=>undo(name)}>Undo</button>
          </div>
        );
      })}

    </div>
  );
}