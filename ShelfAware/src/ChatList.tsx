import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate, useParams } from 'react-router-dom';
import './CSS/ChatDashboard.css';

interface ChatPartner {
  id: string;
  chatId: string;
  displayName: string;
  lastTimestamp: any;
}

export default function ChatList() {
  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const { chatId } = useParams();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('users', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const partners: ChatPartner[] = [];

      for (const chatDoc of querySnapshot.docs) {
        const chatData = chatDoc.data();
        const messagesRef = collection(db, 'chats', chatDoc.id, 'messages');
        const latestMsgQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
        const latestMsgSnap = await getDocs(latestMsgQuery);

        if (!latestMsgSnap.empty) {
          const otherId = chatData.users.find((id: string) => id !== currentUser.uid);
          const userSnap = await getDoc(doc(db, 'users', otherId));
          if (userSnap.exists()) {
            const lastTimestamp = latestMsgSnap.docs[0].data().timestamp;
            partners.push({
              id: otherId,
              chatId: chatDoc.id,
              displayName: userSnap.data().displayName,
              lastTimestamp,
            });
          }
        }
      }

      // Sort by most recent message
      partners.sort((a, b) => b.lastTimestamp?.toMillis?.() - a.lastTimestamp?.toMillis?.());
      setChatPartners(partners);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredPartners = chatPartners.filter((user) =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chatList">
      <h3>Chats</h3>
      <input
        type="text"
        placeholder="Search..."
        className="chatSearchInput"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredPartners.map((user) => (
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



