import React from 'react';
import './CSS/App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UserSignUp from "./CSS/Authentication/signup";
import UserLogin from "./CSS/Authentication/login"; 
import UserLogout from "./CSS/Authentication/logout";

function App() {
  return (
    <Router>
      <div className = "authen">
        <h1 className ='title'>Shelf Aware</h1>
        <nav>
         <Link to = "/signup" className = "loginbutton"> Sign Up </Link>
         <Link to = "/login" className = "loginbutton"> Login </Link>
        </nav>
      </div>

     <div className = "App">
       <Routes>
          <Route path = "/signup" element = {<UserSignUp />} />
          <Route path = "/login" element = {<UserLogin />} />
       </Routes>
     </div>
    </Router>
  );
}

export default App;
