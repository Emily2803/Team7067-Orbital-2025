import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import './CSS/ChatPage.css';

interface UserData {
  id: string;
  displayName: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [searchName, setSearchName] = useState('');
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(query(collection(db, 'users')));
      const users = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter(u => u.id !== currentUser?.uid && u.displayName)
        .sort((a, b) => a.displayName.localeCompare(b.displayName)); // Alphabetical sort

      setAllUsers(users);
      setFilteredUsers(users);
    };

    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    const filtered = allUsers.filter(u =>
      u.displayName.toLowerCase().includes(searchName.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchName, allUsers]);

  const startChatWith = async (otherUser: UserData) => {
    if (!currentUser) return;

    const chatId = [currentUser.uid, otherUser.id].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        users: [currentUser.uid, otherUser.id],
        createdAt: serverTimestamp(),
      });
    }

    navigate(`/chat/${chatId}`);
  };

  return (
  <div className="chatPage">
    <button onClick={() => navigate(-1)} className="chatBackBtn"> Back</button>

    <div className="chatContainer">
      <h2>Start a Chat</h2>

      <input
        type="text"
        placeholder="Search by Display Name"
        value={searchName}
        onChange={e => setSearchName(e.target.value)}
        className="chatSearchInput"
      />

      {errorMsg && <p className="chatError">{errorMsg}</p>}

      <div className="chatUserList">
        <h3>All Available Users</h3>
        {filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          filteredUsers.map(u => (
            <div key={u.id} className="chatUserCard">
              <p>{u.displayName}</p>
              <button onClick={() => startChatWith(u)}>Chat</button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);
}