import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function App() {
const [subjects, setSubjects] = useState([]);

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
  history: [...(s.history || []), present ? "✅" : "❌"]
});

loadSubjects();


};

const undoLast = async (s) => {
if (!s.history || s.history.length === 0) return;


const last = s.history[s.history.length - 1];
const newHistory = s.history.slice(0, -1);

const attendedChange = last === "✅" ? -1 : 0;

const r = doc(db, "subjects", s.id);

await updateDoc(r, {
  attended: s.attended + attendedChange,
  total: s.total - 1,
  history: newHistory
});

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
background: "linear-gradient(180deg,#eef2ff,#f8fafc)",
fontFamily: "-apple-system, system-ui"
}}>


  {/* HERO */}
  <div style={{
    padding: 28,
    background: "linear-gradient(135deg,#6366f1,#7c3aed)",
    color: "white",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    boxShadow: "0 20px 60px rgba(99,102,241,0.3)"
  }}>
    <h2 style={{ marginBottom: 6 }}>Attendance</h2>
    <div style={{
      background: "rgba(255,255,255,0.15)",
      padding: 20,
      borderRadius: 20,
      backdropFilter: "blur(12px)"
    }}>
      <div style={{ opacity: 0.85 }}>Total Attendance</div>
      <div style={{ fontSize: 48, fontWeight: 700 }}>
        {totalAttendance}%
      </div>
    </div>
  </div>

  {/* SUBJECTS */}
  <div style={{ padding: 20 }}>
    {subjects.map(s => {
      const p = percent(s.attended, s.total);
      const low = p < target;

      const attendNext =
        (((s.attended + 1) / (s.total + 1)) * 100).toFixed(1);

      return (
        <div key={s.id} style={card}>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{s.name}</strong>

            <span style={{
              background: low ? "#fee2e2" : "#dcfce7",
              color: low ? "#b91c1c" : "#15803d",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600
            }}>
              {low ? "Attention" : "On Track"}
            </span>
          </div>

          <div style={{ marginTop: 8 }}>
            {s.attended} / {s.total} classes
          </div>

          <div style={{
            marginTop: 10,
            height: 10,
            background: "#e5e7eb",
            borderRadius: 999,
            overflow: "hidden"
          }}>
            <div style={{
              width: `${p}%`,
              background: low
                ? "linear-gradient(90deg,#ef4444,#fb7185)"
                : "linear-gradient(90deg,#22c55e,#4ade80)",
              height: "100%"
            }} />
          </div>

          <div style={{ marginTop: 6 }}>
            {p.toFixed(1)}%
          </div>

          <div style={{ marginTop: 6, fontSize: 13 }}>
            Next attend → {attendNext}%
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button style={presentBtn} onClick={() => markAttendance(s, true)}>Present</button>
            <button style={absentBtn} onClick={() => markAttendance(s, false)}>Absent</button>
            <button style={undoBtn} onClick={() => undoLast(s)}>Undo</button>
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
padding: 20,
borderRadius: 24,
marginBottom: 18,
boxShadow: "0 18px 50px rgba(0,0,0,0.08)"
};

const presentBtn = {
flex: 1,
background: "#22c55e",
color: "white",
border: "none",
padding: "12px",
borderRadius: 14,
fontWeight: 600
};

const absentBtn = {
flex: 1,
background: "#ef4444",
color: "white",
border: "none",
padding: "12px",
borderRadius: 14,
fontWeight: 600
};

const undoBtn = {
background: "#f3f4f6",
color: "#374151",
border: "none",
padding: "12px",
borderRadius: 14,
fontSize: 12
};
