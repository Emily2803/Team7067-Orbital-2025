import { useEffect, useState, useMemo } from "react";
import { db } from "./firebase";
import { doc, setDoc, collection, getDocs, where, query } from "firebase/firestore";
import { format, subDays, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./CSS/InProgressPage.css";

const Achievements = () => {
  const [ userId, setUserId ] = useState(null);
  const [ total, setTotal ] = useState(0);
  const [ usedUp, setUsedUp ] = useState(0);
  const navigate = useNavigate();

  const badges = useMemo(() => [
  {
    name: "First Time Pantry User",
    image: "/badges/FirstTimePantryUser.png",
    unlocked: usedUp>= 1,
    description: "Logged your first pantry item!",
    progress: usedUp,
    require: 1
  },
  {
    name: "Pantry Builder",
    image: "/badges/PantryBuilder.png",
    unlocked: usedUp >= 5,
    description: "Added 5 or more items to your pantry!",
    progress: usedUp,
    require: 5
  },
  {
    name: "Pantry Chef",
    image: "/badges/PantryChef.png",
    unlocked: usedUp >= 3,
    description: "Consumed 3 items in a single day!",
    progress: usedUp,
    require: 3
  }
], [usedUp]);

  useEffect(() => {
    const getUserId = async () => {
      const checkLogin = await getDocs(collection(db, "loginRec"));
      if (!checkLogin.empty) {
        const getId = checkLogin.docs[0].data().userID;
        setUserId(getId);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const processStats = async () => {
      const pantryRec = query(
      collection(db, "pantry"),
        where("userId", "==", userId)
      );
      const getPantryRec = await getDocs(pantryRec);
      const pantryDocs = getPantryRec.docs;
      const dates = pantryDocs.map(doc => {
        const data = doc.data();
        return data.dateAdded?.toDate?.() || data.createdAt?.toDate?.() || data.timestamp?.toDate?.() || null;
      }).filter(Boolean);

      setUsedUp(dates.length);

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

      for (const badge of badges) {
        if (badge.unlocked) {
          const badgeRec = doc(db, "users", userId, "achievements", badge.name);
          await setDoc(
            badgeRec, {unlocked: true, unlockedAt: new Date()},
            {merge: true}
          );
        }
      }
    };
    processStats();
  },[userId, badges]);

  const eachBadge = (badge: any, index:number) => (
    <div className="badgecard" key={index}>
      <img
        src={badge.image}
        alt={badge.name}
        title={badge.description}
        className={`badge ${badge.unlocked ? "": "locked"}`}
      />
      <p>{badge.name}</p>
      {!badge.unlocked && badge.progress > 0 && (
        <div>
          <p>{badge.progress} / {badge.require}</p>
          <progress value={badge.progress} max={badge.require}></progress>
        </div>
      )}
    </div>
  );
  return (
    <div className="contentWrapper">
      <div className="topNav">
        <button className="backBtn" onClick={() => navigate(-1)}>Back</button>
      </div>
      <div className="recipesHeader">
        <h1 className="pageTitle">Achievements 🏆</h1>
        <p className="pageSubtitle">Track your pantry progress and collect badges!</p>
      </div>
      <div className="badgeOri">
        <div className="streak-tracker">
          <h2>🔥 Current Streak: {total} day{total !== 1 ? "s" : ""}</h2>
        </div>
        <h2>Badges</h2>
        <h3>Unlocked</h3>
        <div className="badgeTypes">
          {badges.filter(a => a.unlocked).map(eachBadge)}
        </div>

        <h3>In Progress</h3>
        <div className="badgeTypes">
          {badges.filter(a => !a.unlocked && a.progress > 0).map(eachBadge)}
        </div>

        <h3>Not Started</h3>
        <div className="badgeTypes">
          {badges.filter(a => a.progress === 0).map(eachBadge)}
        </div>
      </div>
    </div>
    );
  };
export default Achievements;