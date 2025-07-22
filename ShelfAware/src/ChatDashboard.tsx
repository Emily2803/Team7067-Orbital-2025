import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import './CSS/ChatDashboard.css';

export default function ChatDashboard() {
  const navigate = useNavigate();

  return (
    <div className="chatDashboard">
      <div className="chatDashboardMain">
        <div className="chatListWithBack">
          <button onClick={() => navigate('/chat')} className="chatBackBtn"> Back</button>
          <ChatList />
        </div>
        <ChatWindow />
      </div>
      <div className="Footerchat">
        <p className="footer-message">Built with 🧡 for students, communities, and fridge space everywhere.</p>
        <p className="footer-copyright">© 2025 ShelfAware. All rights reserved.</p>
      </div>
    </div>
  );
}




