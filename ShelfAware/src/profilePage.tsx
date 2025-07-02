import React, { useEffect, useState } from 'react';
import './CSS/ProfilePage.css';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from "firebase/auth";

const UPLOADCARE_PUBLIC_KEY = "1c6044eae7f09b3a5c87"; 

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [dorm, setDorm] = useState('');
  const [preferences, setPreferences] = useState('');
  const [allergies, setAllergies] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setProfilePicUrl(user.photoURL || '');

      const fetchUserData = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAge(data.age || '');
          setDorm(data.dorm || '');
          setPreferences(data.preferences || '');
          setAllergies(data.allergies || '');
        }
      };

      fetchUserData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
    formData.append("file", file);

    const res = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data && data.file) {
      const cdnUrl = `https://ucarecdn.com/${data.file}/`;
      setProfilePicUrl(cdnUrl);
    } else {
      alert("Failed to upload profile picture.");
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (Number(age) < 1) {
      alert("Age must be at least 1");
      return;
    }

    await updateProfile(user, {
      displayName,
      photoURL: profilePicUrl,
    });

    await setDoc(doc(db, "users", user.uid), {
      displayName,  
      photoURL: profilePicUrl,
      age,
      dorm,
      preferences,
      allergies,
    });

    alert("Profile updated!");
    navigate('/home');
  };

  return (
    <div className="profile-page">
      <h2>Edit Profile</h2>

      {profilePicUrl && (
        <img
          src={profilePicUrl}
          alt="Profile"
          className="profile-picture"
        />
      )}

      <label htmlFor="profile-upload" className="upload-label">
        Upload New Picture
      </label>
      <input
        id="profile-upload"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
      />

      <label>Name</label>
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your Name"
      />

      <label>Email</label>
      <input value={email} disabled />

      <label>Age</label>
      <input
        type="number"
        min="1"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="e.g. 21"
      />

      <label>Dorm / Address</label>
      <textarea
        value={dorm}
        onChange={(e) => setDorm(e.target.value)}
        placeholder="e.g. College of Alice & Peter Tan (NUS)"
      />

      <label>Food Preferences</label>
      <input
        value={preferences}
        onChange={(e) => setPreferences(e.target.value)}
        placeholder="e.g. Vegetarian, No pork"
      />

      <label>Allergies</label>
      <input
        value={allergies}
        onChange={(e) => setAllergies(e.target.value)}
        placeholder="e.g. Peanuts, Shellfish"
      />

      <div className="profile-buttons">
        <button onClick={handleSave}>Save</button>
        <button onClick={() => navigate('/home')}>Cancel</button>
      </div>
    </div>
  );
}





