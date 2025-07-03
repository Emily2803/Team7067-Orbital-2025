import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import "./CSS/ViewProfile.css";

interface ProfileData {
  displayName: string;
  photoURL?: string;
  age?: string;
  dorm?: string;
  preferences?: string;
  allergies?: string;
}

export default function ViewProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile({
          displayName: docSnap.data().displayName || "Anonymous",
          photoURL: docSnap.data().photoURL || "",
          age: docSnap.data().age,
          dorm: docSnap.data().dorm,
          preferences: docSnap.data().preferences,
          allergies: docSnap.data().allergies,
        });
      } else {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [userId]);

  if (!profile) {
    return <div className="view-profile">User not found.</div>;
  }

  return (
    <div className="view-profile-container">
        <div className="view-profile-card">
            <div className="back-button-wrapper">
                <button className="backBut" onClick={() => navigate(-1)}>Back</button>
            </div>

            {profile.photoURL ? ( <img src={profile.photoURL} alt="Profile" className="view-profile-pic" />
            ) : (
            <div className="fallback-avatar">
                <span> {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : "?"} </span>
            </div>
            )}

            <h2 className="view-name">{profile.displayName}</h2>
            <div className="view-profile-details">
                <p><span>Age:</span> {profile.age || "Not provided" }</p>
                <p><span>Dorm:</span> {profile.dorm || "Not provided"}</p>
                <p><span>Preferences:</span> {profile.preferences || "Not provided"}</p>
                <p><span>Allergies:</span> {profile.allergies || "Not provided"}</p>
            </div>
        </div>
    </div>
  );
}

