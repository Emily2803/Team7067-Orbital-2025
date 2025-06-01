import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  addDoc,
  deleteDoc,
  doc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import "./PantryPage.css";

interface PantryItem {
  id: string;
  userId: string;
  name: string;
  expiryDate: Date;
}

export default function PantryPage() {
  const [name, changeName] = useState("");
  const [items, changeItems] = useState<PantryItem[]>([]);
  const [expiry, changeExpiry] = useState("");
  const navigate = useNavigate();

  // Fetch pantry items on login
  useEffect(() => {
    let stopPantry: () => void = () => {};
    const stopAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;

      const dbsearch = query(
        collection(db, "pantry"),
        where("userId", "==", user.uid),
        orderBy("expiryDate")
      );

      stopPantry = onSnapshot(dbsearch, (snapshot) => {
        const data: PantryItem[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            userId: d.userId,
            name: d.name,
            expiryDate: d.expiryDate.toDate(),
          };
        });
        changeItems(data);
      });
    });

    return () => stopPantry();
  }, []);

  // Add new item
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || name === "" || expiry === "") return;

    const expiryDate = Timestamp.fromDate(new Date(expiry));
    try {
      await addDoc(collection(db, "pantry"), {
        userId: auth.currentUser.uid,
        name,
        expiryDate,
      });
      changeName("");
      changeExpiry("");
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Remove item
  const handleRemove = async (id: string) => {
    try {
      await deleteDoc(doc(db, "pantry", id));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="pantryPage">
      <div className="pantryHeader">
        <button className="backBtn" onClick={() => navigate(-1)}>
          Back 
        </button>

        <div className="titleGroup">
          <h1 className="pageTitle"> My Inventory 𝜗𝜚🥐🥬🥛🍉🍰🍭⋆₊˚</h1>
          <p className="pageSubtitle">
            Keep track of expiry dates, reduce waste, and save money! 
          </p>
        </div>

        <form onSubmit={handleAdd} className="pantryForm">
          <input
            type="text"
            placeholder="e.g. Milk, Bread, Eggs"
            value={name}
            onChange={(e) => changeName(e.target.value)}
          />
          <input
            type="date"
            value={expiry}
            onChange={(e) => changeExpiry(e.target.value)}
          />
          <button type="submit">➕ Add</button>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="noItems">(No items in pantry yet 😔)</p>
      ) : (
        <div className="pantryGrid">
          {items.map((item) => {
            const expiryDateObj = item.expiryDate;
            const expiryDate = expiryDateObj.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const timeDiff = expiryDateObj.getTime() - new Date().getTime();
            const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

            let remindText = "";
            if (daysLeft === 3) remindText = "3 days left";
            else if (daysLeft === 2) remindText = "2 days left";
            else if (daysLeft === 1) remindText = "1 day left";
            else if (daysLeft <= 0) remindText = "Expired";

            return (
              <div key={item.id} className="pantryCard">
                <button
                  className="deleteBtn"
                  onClick={() => handleRemove(item.id)}
                >
                  ×
                </button>
                {remindText && (
                  <div className="reminderTag">{remindText}</div>
                )}
                <div className="cardBody">
                  <p className="itemName"> 🍓 {item.name}</p>
                  <p className="itemExpiry">📅 Expires on {expiryDate}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}




    