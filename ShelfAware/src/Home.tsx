import React, { useEffect, useState } from 'react';
import './CSS/Home.css';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import UserLogout from './CSS/Authentication/logout';

const Home: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || 'User');
    } else {
      navigate('/login'); // redirect if not logged in
    }
  }, [navigate]);

  return (
    <div className="home">
      <section className="hero">
        <div className="home-header">
          <h2 className="welcome">👋 Welcome Back, {userName}!</h2>
          <UserLogout />
        </div>

        <h1 className="title">ShelfAware 🍅</h1>
        <p className="subtitle">
          A playful twist on being "self-aware" — but for your pantry.
        </p>
        <p className="highlight">
          Track your food, reduce waste, and make smarter choices.
        </p>
        <button className="cta-button">Start Managing</button>
      </section>

      <section className="features">
        <h2>Why You'll Love ShelfAware</h2>
        <div className="feature-list">
          <div className="feature-card">
            🧠 <strong>Mindful Tracking</strong>
            <p>Stay "shelf-aware" of what is in your pantry and fridge.</p>
          </div>
          <div className="feature-card">
            ⏰ <strong>Expiry Alerts</strong>
            <p>Get notified before your food goes bad — no more nasty surprises.</p>
          </div>
          <div className="feature-card">
            🍳 <strong>Smart Recipes</strong>
            <p>Use ingredients on hand to reduce waste and save money.</p>
          </div>
          <div className="feature-card">
            🤝 <strong>Food Sharing</strong>
            <p>List surplus food for others to claim and build a sustainable community.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;


