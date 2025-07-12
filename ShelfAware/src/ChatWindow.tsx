import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from './firebase';
import {
  doc, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, getDoc
} from 'firebase/firestore';
import { format } from 'date-fns';
import './CSS/ChatDashboard.css';

export default function ChatWindow() {
  const { chatId } = useParams();
  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const fetchReceiverName = async () => {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      const users = chatDoc.data()?.users;
      const otherId = users?.find((id: string) => id !== currentUser.uid);
      if (otherId) {
        const userSnap = await getDoc(doc(db, 'users', otherId));
        setReceiverName(userSnap.data()?.displayName || 'Unknown');
      }
    };

    fetchReceiverName();

    const msgRef = collection(db, 'chats', chatId, 'messages');
    const q = query(msgRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  const sendMessage = async () => {
    if (input.trim() === '' || !currentUser) return;

    await addDoc(collection(db, 'chats', chatId!, 'messages'), {
      text: input,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
    });

    setInput('');
  };

  return (
    <div className="chatWindow">
      <h3 className="chatWithTitle">Chat with {receiverName}</h3>
      <div className="messages">
        {messages.map(msg => {
          const isCurrentUser = msg.senderId === currentUser?.uid;
          const formattedTime = msg.timestamp?.toDate
            ? format(msg.timestamp.toDate(), 'dd MMM yyyy • HH:mm')
            : '';

          return (
            <div
              key={msg.id}
              className={`messageBubble ${isCurrentUser ? 'sent' : 'received'}`}
            >
              <div className="messageMeta">
                <span className="senderName">{isCurrentUser ? 'You' : receiverName}</span>
                <span className="timestamp">{formattedTime}</span>
              </div>
              <p>{msg.text}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="chatInputBar">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}



