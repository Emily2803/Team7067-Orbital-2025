import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "./firebase";
import {
  doc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import "./CSS/ChatWindow.css";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
}

export default function ChatWindow() {
  const { chatId } = useParams<{ chatId: string }>();
  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc : QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !currentUser) return;

    const messageRef = collection(db, "chats", chatId!, "messages");
    await addDoc(messageRef, {
      text: newMessage,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="chatWindowContainer">
      <div className="messagesContainer">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`messageBubble ${msg.senderId === currentUser?.uid ? "sent" : "received"}`}
          >
            <p>{msg.text}</p>
            <span className="timestamp">
              {msg.timestamp?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="messageInputBar">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

