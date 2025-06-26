import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import './Auth.css';
import { auth, db } from "../../firebase";

function UserLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); 

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Logged in!")
            const userAcc = auth.currentUser;
            await addDoc(collection(db, "loginRec"), {
                userID: userAcc?.uid || "",
                email: userAcc?.email || "",
                displayName: userAcc?.displayName || "",
                loginTime: serverTimestamp(),
            });
            if (userAcc) {
                const userRef = doc(db, "users", userAcc.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists() || !userSnap.data()?.email) {
                    await setDoc(userRef, {
                        email: userAcc.email,
                        userId: userAcc.uid,
                        createdAt: serverTimestamp()
                    }, { merge: true });
                    console.log("✅ Email stored in users collection");
                } else {
                    console.log("ℹ️ User already has email in users collection");
                }
            }
            navigate("/home");
        } catch (error: any) {
            console.log(error.message);
            alert("Login failure: " + error.message);
        }
    };

    return (
        <div className="authPopUp">
            <form onSubmit={handleLogin}>
                <button
                    className="closePopUp"
                    type="button"
                    onClick={() => navigate("/")}
                >
                    x
                </button>
                <h2>Login</h2>
                <br />

                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br />

                <div className="password-field">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="toggle-visibilityy"
                        onClick={() => setShowPassword(prev => !prev)}
                    >
                        {showPassword ?  '🔓' : '🔒' }
                    </button>
                </div>
                <br />

                <button type="submit">Log In</button>
            </form>
        </div>
    );
}

export default UserLogin;
