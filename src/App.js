import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function App() {
const [subjects, setSubjects] = useState([]);
const [todayMarked, setTodayMarked] = useState(false);

const target = 75;
const ref = collection(db, "subjects");

const loadSubjects = async () => {
const data = await getDocs(ref);
setSubjects(data.docs.map(d => ({ ...d.data(), id: d.id })));
};

useEffect(() => {
loadSubjects();
// eslint-disable-next-line
}, []);

const markAttendance = async (s, present) => {
const r = doc(db, "subjects", s.id);


await updateDoc(r, {
  attended: s.attended + (present ? 1 : 0),
  total: s.total + 1,
  history: [...s.history, present ? "✅" : "❌"]
});

setTodayMarked(true);
loadSubjects();


};

const percent = (a, t) => t > 0 ? (a / t) * 100 : 0;

const totalAttendance =
subjects.length > 0
? (
subjects.reduce((sum, s) => sum + percent(s.attended, s.total), 0) /
subjects.length
).toFixed(1)
: 0;

return (
<div style={{
minHeight: "100vh",
background: "#f8fafc",
fontFamily: "-apple-system, BlinkMacSystemFont, system-ui"
}}>


  {/* HERO */}
  <div style={{
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "white",
    padding: "32px 20px",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  }}>
    <h2 style={{ margin: 0 }}>Attendance</h2>
    <p style={{ opacity: 0.9 }}>Your daily tracker</p>

    <div style={{
      marginTop: 20,
      background: "rgba(255,255,255,0.15)",
      padding: 20,
      borderRadius: 16,
      backdropFilter: "blur(10px)"
    }}>
      <p style={{ margin: 0 }}>Total Attendance</p>
      <h1 style={{ margin: 0 }}>{totalAttendance}%</h1>
      <small>{todayMarked ? "Updated today" : "Mark today"}</small>
    </div>
  </div>

  {/* SUBJECT LIST */}
  <div style={{ padding: 20 }}>
    {subjects.map(s => {
      const p = percent(s.attended, s.total).toFixed(1);
      const low = p < target;

      const attendNext =
        (((s.attended + 1) / (s.total + 1)) * 100).toFixed(1);

      return (
        <div key={s.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{s.name}</strong>
            <span style={{ color: low ? "#ef4444" : "#22c55e" }}>
              {p}%
            </span>
          </div>

          <div style={{ marginTop: 6, fontSize: 13 }}>
            If attend next → {attendNext}%
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button style={presentBtn} onClick={() => markAttendance(s, true)}>Present</button>
            <button style={absentBtn} onClick={() => markAttendance(s, false)}>Absent</button>
          </div>
        </div>
      );
    })}
  </div>

</div>

);
}

const card = {
background: "white",
padding: 16,
borderRadius: 16,
marginBottom: 14,
boxShadow: "0 10px 24px rgba(0,0,0,0.08)"
};

const presentBtn = {
flex: 1,
background: "#22c55e",
color: "white",
border: "none",
padding: "12px",
borderRadius: 12,
fontWeight: 600
};

const absentBtn = {
flex: 1,
background: "#ef4444",
color: "white",
border: "none",
padding: "12px",
borderRadius: 12,
fontWeight: 600
};
