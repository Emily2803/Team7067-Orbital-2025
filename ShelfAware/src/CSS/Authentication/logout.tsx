import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import './Auth.css'

function UserLogout() {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            const userAcc = auth.currentUser;
            alert('Logged out!')
            } catch (error:any) {
                console.log(error.message);
            }
        };
        return (<button onClick = {handleLogout}>Log Out</button>
        );
}

export default UserLogout;