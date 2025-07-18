import { useEffect, useState, useMemo } from "react";
import { db, auth } from "./firebase";
import { doc, setDoc, collection, getDocs, where, query } from "firebase/firestore";
import { format, subDays, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./CSS/InProgressPage.css";

const Achievements = () => {
  const [ userId, setUserId ] = useState<string | null>(null);
  const [ total, setTotal ] = useState(0);
  const [addedCount, setAddedCount] = useState(0);
  const [ usedUp, setUsedUp ] = useState(0);
  const [ donated, setdonated ] = useState(0);
  const [badges, setBadges] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    }
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
        description: "Logged your first pantry item!",
        progress: addedCount,
        require: 1
      },
      {
        name: "Pantry Builder",
        image: "/badges/PantryBuilder.png",
        unlocked: addedCount >= 5,
        description: "Logged 5 or more items to your pantry!",
        progress: addedCount,
        require: 5
      },
      {
        name: "Pantry Chef",
        image: "/badges/PantryChef.png",
        unlocked: addedCount >= 10,
        description: "Logged 10 items before they expire!",
        progress: usedUp,
        require: 10
      },
      {
        name: "Waste Saver",
        image: "/badges/WasteSaver.png",
        unlocked: usedUp >= 1,
        description: "Consumed 10 items before they expire!",
        progress: usedUp,
        require: 1
      },
      {
        name: "Waste Warrior",
        image: "/badges/WeeklyWarrior.png",
        unlocked: usedUp >= 5,
        description: "Consumed 5 items before they expire!",
        progress: usedUp,
        require: 5
      },
      {
        name: "Waste Vanisher",
        image: "/badges/WasteVanisher.png",
        unlocked: usedUp >= 10,
        description: "Consumed 10 items before they expire!",
        progress: usedUp,
        require: 10
      },
      {
        name: "First Donation",
        image: "/badges/FirstDonation.png",
        unlocked: donated >= 1,
        description: "Donated your first item from your pantry!",
        progress: donated,
        require: 1
      }
    ];
    setBadges(updatedBadges);
}, [addedCount, usedUp, donated ]);

useEffect(() => {
  if (!userId) return;
  const unlockBadge = async () => {
    await Promise.all(
      badges.map(async(badge) => {
        if (badge.unlocked && userId) {
          const badgeRec = doc(db, "users", userId, "achievements", badge.name);
          await setDoc(
            badgeRec, {unlocked: true, unlockedAt: new Date()},
            {merge: true});
        }
      })
    );
  };
  unlockBadge();
},[badges, userId]);

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