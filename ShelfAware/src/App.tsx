import React from 'react';
import './CSS/App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserSignUp from "./CSS/Authentication/signup";
import UserLogin from "./CSS/Authentication/login"; 
import Home from './Home';
import Landing from './Landing';
import PantryPage from "./CSS/Pantry/PantryPage";
import ProfilePage from "./profilePage";
import ChangePassword from "./ChangePassword";
import Recipes from './Recipes';
import ReminderEnabling from "./Reminder";
import CommunityPage from "./CommunityPage";
import Achievements from './Achievement';
import Chats from './ChatPage';
import ViewProfile from './ViewProfile';
import ChatDashboard from './ChatDashboard';

function App() {
  return (
    <>
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
            <Route path="/notifications" element={<ReminderEnabling />} />
            <Route path="/exchange" element={<CommunityPage />} />
            <Route path="/progress" element={<Achievements />}  />
            <Route path="/chat" element={<Chats />} />
            <Route path="/viewprofile/:userId" element={<ViewProfile />} />
            <Route path="/chat/:chatId" element={<ChatDashboard />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

