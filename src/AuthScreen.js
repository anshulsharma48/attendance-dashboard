import React, { useState } from "react";
import { auth, db, storage } from "./firebase";
import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AuthScreen() {
const [signupMode, setSignupMode] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const [name, setName] = useState("");
const [college, setCollege] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [photo, setPhoto] = useState(null);

const signup = async () => {
try {
setLoading(true);
setError("");


  const res = await createUserWithEmailAndPassword(auth, email, password);

  let photoURL = "";

  if (photo) {
    const storageRef = ref(storage, "profiles/" + res.user.uid);
    await uploadBytes(storageRef, photo);
    photoURL = await getDownloadURL(storageRef);
  }

  await setDoc(doc(db, "users", res.user.uid, "profile", "info"), {
    name,
    college,
    email,
    photoURL
  });

} catch (e) {
  setError(e.message);
} finally {
  setLoading(false);
}


};

const login = async () => {
try {
setLoading(true);
setError("");
await signInWithEmailAndPassword(auth, email, password);
} catch (e) {
setError("Invalid email or password");
} finally {
setLoading(false);
}
};

return ( <div style={wrap}> <div style={card}> <h1>Campus Attendance Portal</h1>


    {error && <div style={errorBox}>{error}</div>}

    {signupMode && (
      <>
        <input placeholder="Full name" style={input} onChange={e => setName(e.target.value)} />
        <input placeholder="College name" style={input} onChange={e => setCollege(e.target.value)} />
        <input type="file" style={input} onChange={e => setPhoto(e.target.files[0])} />
      </>
    )}

    <input placeholder="Email" style={input} onChange={e => setEmail(e.target.value)} />
    <input type="password" placeholder="Password" style={input} onChange={e => setPassword(e.target.value)} />

    <button style={primary} disabled={loading} onClick={signupMode ? signup : login}>
      {loading ? "Please wait..." : signupMode ? "Create account" : "Login"}
    </button>

    <button style={link} onClick={() => setSignupMode(!signupMode)}>
      {signupMode ? "Already have account? Login" : "New user? Sign up"}
    </button>
  </div>
</div>


);
}

const wrap = {
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
background: "linear-gradient(135deg,#4f46e5,#7c3aed)"
};

const card = {
background: "white",
padding: 40,
borderRadius: 16,
width: 400
};

const input = {
width: "100%",
padding: 12,
marginBottom: 10,
borderRadius: 8,
border: "1px solid #ddd"
};

const primary = {
width: "100%",
padding: 12,
background: "#4f46e5",
color: "white",
borderRadius: 8
};

const link = {
marginTop: 10,
background: "none",
color: "#4f46e5"
};

const errorBox = {
background: "#fee2e2",
padding: 10,
marginBottom: 10,
borderRadius: 6
};
