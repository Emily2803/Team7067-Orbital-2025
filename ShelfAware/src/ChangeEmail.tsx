import React, { useState } from 'react';
import { auth, db } from './firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import './CSS/ProfilePage.css';

export default function ChangeEmail() {
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user || !user.email) {
      alert('❌ User not authenticated.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      alert('⚠️ Please enter a valid email address.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      if (user.email === newEmail) {
        alert("⚠️ New email must be different from current.");
        return;
      }
      
      await user.reload();
      await sendEmailVerification(user);
      alert("✅ Email updated and verification sent to " + newEmail);

      await updateEmail(user, newEmail);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { email: newEmail });

      navigate('/home');
    } catch (err: any) {
      console.error('Reauth or email update error:', err);
      alert(`⚠️ Failed to update email: ${err.message}`);
    }
  };

  return (
    <div className="profile-page">
      <h2>Change Email</h2>
      <form onSubmit={handleEmailChange}>
        <label>New Email</label>
        <input
          type="email"
          placeholder="Enter your new email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />

        <label>Current Password</label>
        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? '🔓' : '🔒'}
          </button>
        </div>


        <div className="profile-buttons">
          <button type="submit">Update Email</button>
          <button type="button" onClick={() => navigate('/home')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

