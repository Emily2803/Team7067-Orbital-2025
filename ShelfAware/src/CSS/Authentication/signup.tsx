import { auth } from "../../firebase";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import './Auth.css';
import { useNavigate } from 'react-router-dom';

function UserSignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User signed up:", userCredential.user);
            alert("Signed up!");
            setTimeout(() => {
                navigate("/home");
            }, 100);
        } catch (error: any) {
            console.error("Signup error:", error.message);
            alert("Signup failed: " + error.message);
        }
    };

    return (
        <div className="authPopUp">
            <form onSubmit={handleRegister}>
                <button
                    className="closePopUp"
                    type="button"
                    onClick={() => navigate("/")}
                >
                    ×
                </button>
                <h2>Sign Up</h2>

                <input
                    type="text"
                    placeholder="First Name"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Last Name"
                    value={lname}
                    onChange={(e) => setLname(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default UserSignUp;

