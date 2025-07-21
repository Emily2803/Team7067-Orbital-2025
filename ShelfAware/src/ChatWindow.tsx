import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from './firebase';
import {
  doc, collection, addDoc, onSnapshot, serverTimestamp,
  query, orderBy, getDoc, updateDoc
} from 'firebase/firestore';
import { format } from 'date-fns';
import './CSS/ChatDashboard.css';

export default function ChatWindow() {
  const { chatId } = useParams();
  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [chatDoc, setChatDoc] = useState<any>(null);
  const [receiverId, setReceiverId] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const fetchChatData = async () => {
      const chatDocSnap = await getDoc(doc(db, 'chats', chatId));
      const data = chatDocSnap.data();
      setChatDoc(data);

      const users = data?.users || [];
      const otherId = users.find((id: string) => id !== currentUser.uid);
      setReceiverId(otherId);

      if (otherId) {
        const userSnap = await getDoc(doc(db, 'users', otherId));
        setReceiverName(userSnap.data()?.displayName || 'Unknown');

        // Mark as read
        await updateDoc(doc(db, 'chats', chatId), {
          [`lastRead.${currentUser.uid}`]: serverTimestamp()
        });
      }
    };

    fetchChatData();

    const msgRef = collection(db, 'chats', chatId, 'messages');
    const q = query(msgRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMessages(msgs);

      // Mark as read on new message
      updateDoc(doc(db, 'chats', chatId), {
        [`lastRead.${currentUser.uid}`]: serverTimestamp()
      });

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

    await updateDoc(doc(db, 'chats', chatId!), {
      lastSenderId: currentUser.uid,
      [`readBy.${currentUser.uid}`]: true,
      [`readBy.${receiverId}`]: false,
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

          // Seen/Sent logic
          let messageStatus = '';
          if (isCurrentUser && chatDoc?.lastRead?.[receiverId]) {
            const seenTime = chatDoc.lastRead[receiverId].toMillis?.();
            const msgTime = msg.timestamp?.toMillis?.();
            messageStatus = seenTime >= msgTime ? 'Seen' : 'Sent';
          }
          

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
              {isCurrentUser && <span className="messageStatus">{messageStatus}</span>}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chatInputBar">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}





