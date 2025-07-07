import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

function UserSignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  const isStrongPassword = (password: string) =>
    password.length >= 8 && /[^A-Za-z0-9]/.test(password); // at least one special char

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      alert("⚠️ Please enter a valid email address.");
      return;
    }

    if (!isStrongPassword(password)) {
      alert(" Password must be at least 8 characters and include a special character.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, {
        displayName: `${firstName} ${lastName}`
      });

      await auth.currentUser?.reload();
      const user = auth.currentUser;

      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          email: user.email,
          name: user.displayName,
          dorm: "",
          allergies: "",
          preferences: "",
          createdAt: serverTimestamp(),
          notificationsEnabled: true
        });
        console.log("✅ User profile stored in Firestore");
      }

      navigate('/home');
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          alert(" This email is already registered.");
          break;
        case 'auth/invalid-email':
          alert(" Invalid email address.");
          break;
        case 'auth/weak-password':
          alert(" Password is too weak.");
          break;
        default:
          alert("⚠️ " + error.message);
      }
    }
  };

  return (
    <div className="authPopUp">
      <form onSubmit={handleSignup}>
        <button type="button" className="closePopUp" onClick={() => navigate('/')}>×</button>
        <h2>Sign Up</h2>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-visibilityy"
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? '🔓' : '🔒'}
          </button>
        </div>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default UserSignUp;




