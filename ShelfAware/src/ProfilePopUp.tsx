import React from "react";
import "./CSS/ProfilePopUp.css";

interface ProfilePopupProps {
  profile: {
    displayName: string;
    photoURL?: string;
    age?: string;
    dorm?: string;
    preferences?: string;
    allergies?: string;
  };
  onClose: () => void;
}

export default function ProfilePopup({ profile, onClose }: ProfilePopupProps) {
  return (
    <div className="profile-popup-overlay" onClick={onClose}>
      <div className="profile-popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}> ✖ </button>

        {profile.photoURL ? (
          <img src={profile.photoURL} alt="Profile" className="popup-avatar" />
        ) : (
          <div className="popup-fallback-avatar">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <h3>{profile.displayName}</h3>
        <div className="popup-details">
          <p><strong>Age:</strong> {profile.age || "Not provided"}</p>
          <p><strong>Dorm:</strong> {profile.dorm || "Not provided"}</p>
          <p><strong>Preferences:</strong> {profile.preferences || "Not provided"}</p>
          <p><strong>Allergies:</strong> {profile.allergies || "Not provided"}</p>
        </div>
      </div>
    </div>
  );
}
