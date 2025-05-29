import React from 'react';
import './CSS/Home.css';
import Footer from './Footer';

const Home: React.FC = () => {
  return (
    <>

    <div className="home">
      <section className="hero">
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

    </>
  );
};

export default Home;

