import { auth } from "../../firebase";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import './Auth.css'
import { useNavigate } from 'react-router-dom';

function UserSignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const[fname, setFname] = useState("");
    const[lname, setLname] = useState("");

    const handleRegister = async(e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Signed up!")
        } catch (error:any) {
            console.log(error.message);
        }
    };
    return(
        <div className = "authPopUp">
         <form onSubmit={handleRegister}>
          <button
           className = "closePopUp"
           type = "button"
           onClick = {() => navigate("/")}
           >
            x
          </button>
            <h2>Sign Up</h2>
            <br/>
            
                <input
                 type = "text"
                 placeholder = "First Name"
                 onChange = {(e) => setFname(e.target.value)}
                 required
                />
                <br/>

                <input
                 type = "text"
                 placeholder = "Last Name"
                 onChange = {(e) => setLname(e.target.value)}
                 required
                />
                <br/>

                <input 
                 type ="email"
                 placeholder = "Email"
                 onChange={(e) => setEmail(e.target.value)}
                 required
                />
                <br/>
            
                <input 
                 type = "password"
                 placeholder = "Password"
                 onChange = {(e) => setPassword(e.target.value)}
                 required 
                />
                <br/>

                <button type = "submit">Sign Up</button>
            </form>
        </div>
    );
}

export default UserSignUp;