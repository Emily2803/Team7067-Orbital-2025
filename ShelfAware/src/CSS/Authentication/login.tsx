import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import './Auth.css'
import { auth, db } from "../../firebase";

function UserLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            const userAcc = auth.currentUser;
            await addDoc(collection(db, "loginRec"), {
                userID: userAcc?.uid || "",
                email: userAcc?.email || "",
                loginTime: serverTimestamp(),
            });
            alert("Logged in!")
            navigate("/");
    
        } catch (error:any) {
            console.log(error.message);
            alert("Login failure: " + error.message)
        }
    };

    return(
        <div className="authPopUp">
          <form onSubmit={handleLogin}>
          <button
           className = "closePopUp"
           type = "button"
           onClick = {() => navigate("/")}
           >
            x
           </button>
            <h2>Login</h2>
            <br/>

            <input 
             type = "email"
             placeholder = "Email"
             onChange={(e) => setEmail(e.target.value)} 
            />
            <br/>
            <input 
             type = "password"
             placeholder = "Password"
             onChange = {(e) => setPassword(e.target.value)} 
            />
            <br/>

            <button type = "submit">Log In</button>
         </form>
        </div>
    );
}

export default UserLogin;
