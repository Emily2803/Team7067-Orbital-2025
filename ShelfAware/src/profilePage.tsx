import React, { useEffect, useState } from 'react';
import './CSS/ProfilePage.css';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from "firebase/auth"; 

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSave = () => {
    const user = auth.currentUser;
    if (user) {
      updateProfile(user, { displayName })
        .then(() => alert("Profile updated!"))
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="profile-page">
      <h2>Edit Profile</h2>
      <label>Name</label>
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your Name"
      />

      <label>Email</label>
      <input type="text" value={email} disabled />

      <div className="profile-buttons">
        <button onClick={handleSave}>Save</button>
        <button onClick={() => navigate('/home')}>Back</button>
      </div>
    </div>
  );
}

