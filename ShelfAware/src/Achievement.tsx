import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, where, query } from "firebase/firestore";
import { format, subDays, isSameDay } from "date-fns";
import "./CSS/InProgressPage.css";

const Achievements = () => {
  const [ userId, setUserId ] = useState(null);
  const [ total, setTotal ] = useState(0);
  const [ usedUp, setUsedUp ] = useState(0);

  const badges = [
  {
    name: "First Time Pantry User",
    image: "/badges/FirstTimePantryUser.png",
    unlocked: usedUp>= 1,
    description: "Logged your first pantry item!"
  },
  {
    name: "Pantry Builder",
    image: "/badges/PantryBuilder.png",
    unlocked: usedUp >= 5,
    description: "Added 5 or more items to your pantry!"
  },
  {
    name: "Pantry Chef",
    image: "/badges/PantryChef.png",
    unlocked: usedUp >= 3,
    description: "Consumed 3 items in a single day!"
  }
];

  useEffect(() => {
    const getUserId = async () => {
      const checkLogin = await getDocs(collection(db, "loginRec"));
      if (!checkLogin.empty) {
        const getId = checkLogin.docs[0].data().userId;
        setUserId(getId);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const processStats = async () => {
      const newRec = query(
      collection(db, "consumeLogs"),
        where("userId", "==", userId)
      );
      const getNewRec = await getDocs(newRec);

      const dates = getNewRec.docs.map(eachDoc => eachDoc.data().date?.toDate())
        .filter(Boolean);

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
    };
    processStats();
  },[userId]);

  return (
    <div className="badgeOri">
      {badges.map((badge, index) => (
        <div className="badgecard" key={index}>
          <img
            src={badge.image}
            alt={badge.name}
            title={badge.description}
            className={badge.unlocked ? "badge" : "badge locked"}
          />
          <p>{badge.name}</p>
        </div>
      ))}
    </div>
  );
};
  export default Achievements;