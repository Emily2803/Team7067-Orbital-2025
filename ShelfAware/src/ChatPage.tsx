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
import Footer from './Footer';
import ProfilePopup from './ProfilePopUp';

interface UserData {
  id: string;
  displayName: string;
}

interface ProfileData {
  displayName: string;
  photoURL?: string;
  age?: string;
  dorm?: string;
  preferences?: string;
  allergies?: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [searchName, setSearchName] = useState('');
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeProfile, setActiveProfile] = useState<ProfileData | null>(null); 

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(query(collection(db, 'users')));
      const users = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter(u => u.id !== currentUser?.uid && u.displayName)
        .sort((a, b) => a.displayName.localeCompare(b.displayName)); 

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

  const handleViewProfile = async (userId: string) => {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      setActiveProfile({
        displayName: data.displayName,
        photoURL: data.photoURL,
        age: data.age,
        dorm: data.dorm,
        preferences: data.preferences,
        allergies: data.allergies,
      });
    }
  };

  return (
    <div className="outsidecontainer">
      <div className="chatPage">
        <button onClick={() => navigate('/home')} className="chatBackBtns"> Back</button>

        <div className="chatContainer">
          <h2>Start a Chat</h2>
          <p className="chatsubtitle">Search for someone and start a conversation 🍃</p>

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
                  <div className="tooltipWrapper">
                  <span
                    className="tooltipTarget"
                    onClick={() => handleViewProfile(u.id)}
                  >
                    {u.displayName}
                  </span>
                  <div className="customTooltip">View Profile</div>
                </div>
                  <button onClick={() => startChatWith(u)}>Chat</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />

      {activeProfile && (
        <ProfilePopup
          profile={activeProfile}
          onClose={() => setActiveProfile(null)}
        />
      )}
    </div>
  );
}