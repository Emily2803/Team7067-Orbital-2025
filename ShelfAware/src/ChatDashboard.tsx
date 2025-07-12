import React from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import './CSS/ChatDashboard.css';
import { db, auth } from './firebase';

export default function ChatDashboard() {
  const currentUser = auth.currentUser;

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="chatDashboard">
      <ChatList />
      <ChatWindow />
    </div>
  );
}

