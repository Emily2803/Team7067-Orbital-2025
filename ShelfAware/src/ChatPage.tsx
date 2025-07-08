import React, { useState, useEffect } from "react";
import { collection, doc, getDocs, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./CSS/ChatPage.css";

export default function ChatPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  useEffect(() => {
    const loadUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const filtered = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName || `User-${doc.id.substring(0, 6)}`
        };
      });
      setUsers(filtered.filter(u => u.id !== currentUser?.uid)); // remove self
    };
    loadUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const chatId = [currentUser.uid, selectedUser.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data());
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedUser, currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    const chatId = [currentUser.uid, selectedUser.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");

    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      receiverId: selectedUser.id,
      text: newMessage,
      timestamp: new Date(),
    });

    setNewMessage("");
  };

  return (
    <div className="chatPage">
      <div className="chatSidebar">
        <button className="backBtn" onClick={() => navigate(-1)}> Back</button>
        <h3>Chats</h3>
        <ul className="userList">
          {users.map(user => (
            <li
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={selectedUser?.id === user.id ? "selected" : ""}
            >
              @{user.displayName}
            </li>
          ))}
        </ul>
      </div>

      <div className="chatMain">
        {selectedUser ? (
          <>
            <div className="chatHeader">@{selectedUser.displayName}</div>
            <div className="chatMessages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`chatBubble ${
                    msg.senderId === currentUser?.uid ? "sent" : "received"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="chatInput">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="chatPlaceholder">Select a user to chat with</div>
        )}
      </div>
    </div>
  );
}


