import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
collection,
getDocs,
updateDoc,
doc
} from "firebase/firestore";

export default function App() {
const [subjects, setSubjects] = useState([]);
const [todayMarked, setTodayMarked] = useState(false);
const [dark, setDark] = useState(false);

const target = 75;
const ref = collection(db, "subjects");

const loadSubjects = async () => {
const data = await getDocs(ref);
setSubjects(data.docs.map(d => ({ ...d.data(), id: d.id })));
};

useEffect(() => {
loadSubjects();
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
).toFixed(2)
: 0;

const lowSubjects = subjects.filter(
s => percent(s.attended, s.total) < target
);

const bg = dark
? "linear-gradient(120deg,#020617,#0f172a)"
: "linear-gradient(120deg,#eef2ff,#f8fafc,#ecfeff)";

const text = dark ? "#e5e7eb" : "#111827";

return (
<div style={{ display: "flex", minHeight: "100vh", background: bg, color: text }}>


  {/* SIDEBAR */}
  <div style={{
    width: 240,
    padding: 24,
    background: dark ? "rgba(2,6,23,0.7)" : "rgba(255,255,255,0.7)",
    backdropFilter: "blur(12px)"
  }}>
    <h2>🚀 Attendance</h2>
    <p style={{ opacity: 0.7 }}>Today</p>
    <p style={{ opacity: 0.7 }}>Insights</p>
    <p style={{ opacity: 0.7 }}>Subjects</p>
  </div>

  {/* MAIN */}
  <div style={{ flex: 1, padding: 32 }}>

    {/* HEADER */}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24
    }}>
      <h1>Startup Dashboard</h1>

      <button
        onClick={() => setDark(!dark)}
        style={{ padding: "6px 12px", borderRadius: 8, border: "none" }}
      >
        {dark ? "Light Mode" : "Dark Mode"}
      </button>
    </div>

    {/* TODAY ACTION */}
    <Panel title="🟢 Today Action">
      <p>
        {todayMarked
          ? "Attendance recorded for today."
          : "Mark attendance for today to keep records updated."}
      </p>
    </Panel>

    {/* INSIGHTS */}
    <Panel title="🧠 Insights">
      {lowSubjects.length > 0
        ? `Focus on: ${lowSubjects.map(s => s.name).join(", ")}`
        : "All subjects are in healthy range."}
    </Panel>

    {/* HEALTH */}
    <Panel title="📊 Attendance Health">
      Total Attendance: <strong>{totalAttendance}%</strong>
    </Panel>

    {/* SUBJECTS */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
      gap: 20,
      marginTop: 20
    }}>
      {subjects.map(s => {
        const p = percent(s.attended, s.total).toFixed(1);
        const low = p < target;

        return (
          <div key={s.id} style={tile}>
            <h3>{s.name}</h3>

            <p>{s.attended}/{s.total} — {p}%</p>

            <span style={{
              color: low ? "#ef4444" : "#22c55e",
              fontWeight: 600
            }}>
              {low ? "Needs Attention" : "On Track"}
            </span>

            <div style={{ marginTop: 12 }}>
              <button style={presentBtn} onClick={() => markAttendance(s, true)}>Present</button>
              <button style={absentBtn} onClick={() => markAttendance(s, false)}>Absent</button>
            </div>
          </div>
        );
      })}
    </div>

  </div>
</div>


);
}

function Panel({ title, children }) {
return (
<div style={{
background: "rgba(255,255,255,0.85)",
backdropFilter: "blur(12px)",
padding: 20,
borderRadius: 16,
marginBottom: 20,
boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
}}> <h3>{title}</h3> <p>{children}</p> </div>
);
}

const tile = {
background: "rgba(255,255,255,0.85)",
backdropFilter: "blur(12px)",
padding: 20,
borderRadius: 16,
boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const presentBtn = {
marginRight: 8,
background: "#22c55e",
color: "white",
border: "none",
padding: "8px 12px",
borderRadius: 8
};

const absentBtn = {
background: "#ef4444",
color: "white",
border: "none",
padding: "8px 12px",
borderRadius: 8
};
