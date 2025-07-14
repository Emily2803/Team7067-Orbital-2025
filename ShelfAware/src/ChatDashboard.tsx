import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import './CSS/ChatDashboard.css';

export default function ChatDashboard() {
  const navigate = useNavigate();

  return (
    <div className="chatDashboard">
      <button onClick={() => navigate('/chat')} className="chatBackBtn">Back</button>
      <div className="chatDashboardMain">
        <ChatList />
        <ChatWindow />
      </div>
    </div>
  );
}


