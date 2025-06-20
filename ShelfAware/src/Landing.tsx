import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Landing.css';
import Footer from './Footer';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className ="mainwrapper">
    <div className="landing-container">
      <div className="landing-card">
        <h1 className="landing-title">
          <span className="emoji">👋</span> Welcome to <span className="brand">ShelfAware ! </span> 
        </h1>
        <p className="subtitle">Less waste. Less stress. More fridge space.</p>
        <div className="landing-buttons">
          <button onClick={() => navigate('/login')}>Log In</button>
          <button onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </div>
    </div>
      <Footer /> 
    </div>

  );
};

export default Landing;



