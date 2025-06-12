import React, { useEffect, useState } from 'react';
import './CSS/Home.css';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import UserLogout from './CSS/Authentication/logout';
import FoodGif from './CSS/Food.gif';
import PantryBg from './CSS/pantry.jpg';
import ProfileIcon from './CSS/profile-icon.svg'; 

const Home: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || 'User');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="home">
      <section className="hero" style={{ backgroundImage: `url(${PantryBg})` }}>
    <div className="hero-dim" />

  <div className="profile-wrapper">
  <img
      src={ProfileIcon}
      alt="Profile"
      className="profile-icon"
      onClick={() => setShowDropdown(!showDropdown)}
      title="Profile Menu"
    />

    <div
  className={`profile-dropdown ${showDropdown ? 'visible' : 'hidden'}`}
>
  <button onClick={() => { setShowDropdown(false); navigate("/profile"); }}>
    Edit Profile
  </button>
  <button onClick={() => { setShowDropdown(false); navigate("/changepassword"); }}>
    Change Password
  </button>
</div>
  </div>

  <div className='logout-wrap'> <UserLogout /></div>

    <div className="main-content">
      <h2 className="welcome">👋 Welcome Back, {userName}!</h2>
      <div className="title-row">
        <h1 className="title">ShelfAware</h1>
        <img src={FoodGif} alt="Pantry gif" className="title-gif" />
      </div>
      <p className="subtitle">
        a playful twist on being "self-aware" — but for your pantry ִ ࣪𖤐.ᐟ 
      </p>
      <button className="cta-button" onClick={() => navigate("/pantry")}>
        Open My Pantry
      </button>
    </div>
    </section>


      <section className="features">
        <h2>Why Use ShelfAware?</h2>
        <div className="feature-list">
          <div className="feature-card">
            🧠 <strong>Track with Intention</strong>
            <p>Stay aware of what’s in your kitchen and when it expires.</p>
          </div>
          <div className="feature-card">
            ⏰ <strong>Expiry Notifications</strong>
            <p>Gentle nudges to help you eat food before it's too late.</p>
          </div>
          <div className="feature-card">
            🍳 <strong>Recipe Suggestions</strong>
            <p>Use what you have — cook smarter, not harder.</p>
          </div>
          <div className="feature-card">
            🥕 <strong>Food Exchange</strong>
            <p>Share surplus ingredients with others and reduce waste.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;




