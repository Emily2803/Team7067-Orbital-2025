import { useEffect, useState, useMemo } from "react";
import { db, auth } from "./firebase";
import { doc, setDoc, collection, getDocs, where, query, onSnapshot, getDoc } from "firebase/firestore";
import { format, subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./CSS/Achievement.css";
import Footer from "./Footer";
import Confetti from 'react-confetti';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProfilePopup from "./ProfilePopUp";

interface ProfileData {
  displayName: string;
  photoURL?: string;
  age?: string;
  dorm?: string;
  preferences?: string;
  allergies?: string;
}

const Achievements = () => {
  const [ userId, setUserId ] = useState<string | null>(null);
  const [ total, setTotal ] = useState(0);
  const [addedCount, setAddedCount] = useState(0);
  const [ usedUp, setUsedUp ] = useState(0);
  const [ donated, setdonated ] = useState(0);
  const [badges, setBadges] = useState<any[]>([]);
  const [popUpBadge, setPopUpBadge] = useState<any | null>(null);
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimedBadges, setClaimedBadges] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<ProfileData | null>(null);


  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
        collection(db, "users", userId, "achievements"),
        (snapshot) => {
          const unlockedNames = snapshot.docs.map(doc => doc.id);
          setClaimedBadges(unlockedNames);
        }
    );

    const processStats = async () => {
      const pantryRec = query(
      collection(db, "pantry"),
        where("userId", "==", userId)
      );
      const getPantryRec = await getDocs(pantryRec);
      const pantryDocs = getPantryRec.docs;
      const dates = pantryDocs.map(eachDoc => {
        const data = eachDoc.data();
        return data.dateAdded?.toDate?.() || data.createdAt?.toDate?.() || data.timestamp?.toDate?.() || null;
      }).filter(Boolean);

      setAddedCount(dates.length);

      const consumedRec = query(collection(db, "consumedLogs"), where("userId", "==", userId));
      const getConsumeRec = await getDocs(consumedRec);
      const consumedDocs = getConsumeRec.docs;
      const consumedDates = consumedDocs.map(eachDoc =>
        eachDoc.data().consumedAt?.toDate?.() || null
      ).filter(Boolean);
      setUsedUp(consumedDates.length);

      const donationRec = query(collection(db, "donationCount"), where("userId", "==", userId));
      const getDonatedRec = await getDocs(donationRec);
      setdonated(getDonatedRec.docs.length);

      const dateString = new Set(dates.map(
        dateS => format(dateS, "yyyy-MM-dd"))
      );

      let totalCount = 0;
      let x = 0;
      while (x < 30) {
        const day = format(subDays(new Date(), x), "yyyy-MM-dd");
        if (dateString.has(day)) {
          totalCount += 1;
          x += 1;
        } else {
          break;
        }
      }
      setTotal(totalCount);
    };
    processStats();
  }, [userId]);

  useEffect(() => {
    const updatedBadges = [
      {
        name: "First Time Pantry User",
        image: "/badges/FirstTimePantryUser.png",
        unlocked: addedCount>= 1,
        description: "Log your first pantry item!",
        progress: addedCount,
        require: 1
      },
      {
        name: "Pantry Builder",
        image: "/badges/PantryBuilder.png",
        unlocked: addedCount >= 5,
        description: "Log 5 or more items to your pantry!",
        progress: addedCount,
        require: 5
      },
      {
        name: "Pantry Chef",
        image: "/badges/PantryChef.png",
        unlocked: addedCount >= 10,
        description: "Log 10 items before they expire!",
        progress: addedCount,
        require: 10
      },
      {
        name: "Waste Saver",
        image: "/badges/WasteSaver.png",
        unlocked: usedUp >= 1,
        description: "Consume 1 items in your pantry!",
        progress: usedUp,
        require: 1
      },
      {
        name: "Waste Warrior",
        image: "/badges/WeeklyWarrior.png",
        unlocked: usedUp >= 5,
        description: "Consume 5 items in your pantry!",
        progress: usedUp,
        require: 5
      },
      {
        name: "Waste Vanisher",
        image: "/badges/WasteVanisher.png",
        unlocked: usedUp >= 10,
        description: "Consume 10 items in your pantry!",
        progress: usedUp,
        require: 10
      },
      {
        name: "First Donation",
        image: "/badges/FirstDonation.png",
        unlocked: donated >= 1,
        description: "Donate your first item from your pantry!",
        progress: donated,
        require: 1
      },
      {
        name: "Kind Donor",
        image: "/badges/Kind Donor.png",
        unlocked: donated >= 5,
        description: "Donate 5 items from your pantry!",
        progress: donated,
        require: 5
      },
      {
        name: "Generous Giver",
        image: "/badges/GenerousGiver.png",
        unlocked: donated >= 10,
        description: "Donate 10 items from your pantry!",
        progress: donated,
        require: 10
      },
      {
        name: "Century Saver",
        image: "/badges/CenturySaver.png",
        unlocked: total >= 100,
        description: "Maintain a 100 days of food logging streak!",
        progress: total,
        require: 100
      },
      {
        name: "Pantry King",
        image: "/badges/PantryKing.png",
        unlocked: addedCount >= 100,
        description: "Add 100 items to your pantry!",
        progress: addedCount,
        require: 100
      },
      {
        name: "ShelfAware Champion",
        image: "/badges/ShelfAwareChampion.png",
        unlocked: donated >= 200,
        description: "Donate 200 items from your pantry!",
        progress: donated,
        require: 200,
      },
    ];
    setBadges(updatedBadges);
}, [addedCount, usedUp, donated, total]);

useEffect(() => {
  if (!userId) return;
  const unlockBadge = async () => {
    await Promise.all(
      badges.map(async (badge) => {
        if (badge.unlocked && !claimedBadges.includes(badge.name)) {

          const badgeRec = doc(db, "users", userId, "achievements", badge.name);
          await setDoc(
            badgeRec,
            { unlocked: true, unlockedAt: new Date() },
            { merge: true }
          );

          // Trigger confetti and toast
          setShowConfetti(true);
          toast.success( <div className="toastFont" > 
           `🎉 You just unlocked {badge.name} 🏅!` </div>, {
            position: "top-center",
            autoClose: 5000,
          });

          setTimeout(() => setShowConfetti(false), 5000);
        }
      })
    );
  };

  unlockBadge();
}, [badges, userId, claimedBadges]);


  const eachBadge = (badge: any, index:number) => (
    <div className="badgecard" key={index} onClick={() => setPopUpBadge(badge)}
      style={{ cursor:"pointer"}}>
      <img
        src={badge.image}
        alt={badge.name}
        className={`badge ${badge.unlocked ? "": "locked"}`}
      />
      <p>{badge.name}</p>
      {badge.unlocked ? (
        <div className="badgeCompleted">
          <p>Completed ✅</p>
        </div>
      ) : badge.progress > 0 ? (
        <div className="badgeInProgress">
          <p>{badge.progress} / {badge.require}</p>
          <progress value={badge.progress} max={badge.require}></progress>
        </div>
      ):(
        <div className="badgeLocked">
          <p>Locked 🔒</p>
        </div>
      )}
    </div>
  )
      

  const unlockedSec = badges.filter(b => b.unlocked);
  const inProgressSec = badges.filter(b => !b.unlocked && b.progress > 0);
  const lockedSec = badges.filter(b => b.progress === 0);

  useEffect(() => {
  const fetchLeaderboard = async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    const usersData = [];

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userInfo = userDoc.data();

      const achievementsRef = collection(db, "users", userId, "achievements");
      const achievementsSnap = await getDocs(achievementsRef);
      const unlockedCount = achievementsSnap.docs.filter(doc => doc.data().unlocked).length;

      usersData.push({
        userId,
        displayName: userInfo.displayName || "Anonymous",
        photoURL: userInfo.photoURL || "",
        unlockedCount
      });
    }

    // Sort and take top 5
    const topUsers = usersData
      .sort((a, b) => b.unlockedCount - a.unlockedCount)
      .slice(0, 5);

    setLeaderboard(topUsers);
  };

  fetchLeaderboard();
}, []);

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
    <div className="mainwrapper">
    <div className="contentWrapper">
      <div className="topNav">
        <button className="backBtn" onClick={() => navigate(-1)}>Back</button>
      </div>
      <div className="recipesHeader">
        <h1 className="pageTitles">Achievements 🏆</h1>
        <p className="pageSubtitles">Track your pantry progress and collect badges!</p>
      </div>
      <div className="streak-tracker">
        <span className="streakmsg">
          Current Streak 🔥: {total} day{total !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="badgeOri">
        <h2>Badges</h2>
        {unlockedSec.length > 0 && (
          <>
            <h3>Unlocked</h3>
            <div className="badgeTypes">
              {unlockedSec.map(eachBadge)}</div>
          </>
        )}
        {inProgressSec.length > 0 && (
          <>
            <h3>In Progress</h3>
            <div className="badgeTypes">
              {inProgressSec.map(eachBadge)}
            </div>
          </>
        )}
        {lockedSec.length > 0 && (
          <>
            <h3>Not Started</h3>
            <div className="badgeTypes">
              {lockedSec.map(eachBadge)}
            </div>
          </>
        )}
      </div>
      {popUpBadge &&(
        <div className="modalOverlay" onClick={() => setPopUpBadge(null)}>
          <div className="modalContent" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPopUpBadge(null)}>✖</button>
            <img
              src={popUpBadge.image}
              alt={popUpBadge.name}
              className="modal-badge-img"
            /> 
            <h2>{popUpBadge.name}</h2>
            <p>{popUpBadge.description}</p>
            <div className="modal-progress">
              <p>{popUpBadge.progress} / {popUpBadge.require}</p>
              <progress value={popUpBadge.progress} max={popUpBadge.require} />
            </div>
          </div>
        </div>
      )}

      <h2 className="leaderboard-title">🏅 Top 5 Badge Collectors</h2>
      <p className="leaderboard-subtitle">
        These champions lead the fight against food waste 🥦🎖️
      </p>
      <div className="leaderboard-container">
      <div className="leaderboard">
        {leaderboard.map((user, index) => (
          <div key={user.userId} className="leaderboard-item">
            <span className="rank">#{index + 1}</span>
            {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="profile-pic" />
            ) : (
              <div className="popup-fallback-avatars">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
              <div className="tooltipWrapper">
              <span
                className="name"
                onClick={() => handleViewProfile(user.userId)}
              >
                {user.displayName}
              </span>
              <div className="customTooltip">View Profile</div>
              </div>
              
            <span className="count">{user.unlockedCount} Badges</span>
          </div>
        ))}
        </div>
      </div>
    {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <ToastContainer />
      {activeProfile && (
        <ProfilePopup
          profile={activeProfile}
          onClose={() => setActiveProfile(null)}
        />
      )}
    </div>
    <Footer />
    </div>
  );
};
export default Achievements;