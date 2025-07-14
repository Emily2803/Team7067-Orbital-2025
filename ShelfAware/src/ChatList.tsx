import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate, useParams } from 'react-router-dom';
import './CSS/ChatDashboard.css';

export default function ChatList() {
  const [chatPartners, setChatPartners] = useState<any[]>([]);
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const { chatId } = useParams();

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser) return;

      const q = query(collection(db, 'chats'), where('users', 'array-contains', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const users: any[] = [];

      for (let docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const messagesRef = collection(db, 'chats', docSnap.id, 'messages');
      const messagesSnap = await getDocs(messagesRef);

      if (!messagesSnap.empty) {  // Only if messages exist
        const otherId = data.users.find((id: string) => id !== currentUser.uid);
        const userSnap = await getDoc(doc(db, 'users', otherId));
        if (userSnap.exists()) {
          users.push({ ...userSnap.data(), id: otherId, chatId: docSnap.id });
        }
      }
    }


      setChatPartners(users);
    };

    fetchChats();
  }, [currentUser]);

  return (
    <div className="chatList">
      <h3>Chats</h3>
      {chatPartners.map(user => (
        <div
          key={user.id}
          className={`chatListItem ${chatId === user.chatId ? 'active' : ''}`}
          onClick={() => navigate(`/chat/${user.chatId}`)}
        >
          <p>{user.displayName}</p>
        </div>
      ))}
    </div>
  );
}


