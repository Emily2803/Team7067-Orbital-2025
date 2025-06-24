import React from 'react';
import './CSS/App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserSignUp from "./CSS/Authentication/signup";
import UserLogin from "./CSS/Authentication/login"; 
import Home from './Home';
import Landing from './Landing';
import PantryPage from "./CSS/Pantry/PantryPage";
import NotificationSetup from "./Notification";
import ProfilePage from "./profilePage";
import ChangePassword from "./ChangePassword";
import Recipes from './Recipes';

function App() {
  return (
    <>
      <NotificationSetup/>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} /> 
            <Route path="/signup" element={<UserSignUp />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/home" element={<Home />} />
            <Route path="/pantry" element={<PantryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/recipes" element={<Recipes />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

