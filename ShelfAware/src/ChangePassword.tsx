import React, { useState } from 'react';
import { auth } from './firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './CSS/ProfilePage.css';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user || !user.email) {
      alert('User not authenticated.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert('Password updated successfully!');
      navigate('/home');
    } catch (err: any) {
      alert('Error: ' + err.message);
      console.error(err);
    }
  };

  return (
    <div className="profile-page">
      <h2>Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <label>Current Password</label>
        <div className="password-field">
          <input
            type={showCurrent ? 'text' : 'password'}
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setShowCurrent((prev) => !prev)}
          >
            {showCurrent ? '🔓' : '🔒'}
          </button>
        </div>

        <label>New Password</label>
        <div className="password-field">
          <input
            type={showNew ? 'text' : 'password'}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setShowNew((prev) => !prev)}
          >
            {showNew ? '🔓' : '🔒'}
          </button>
        </div>

        <div className="profile-buttons">
          <button type="submit">Update Password</button>
          <button type="button" onClick={() => navigate('/home')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}