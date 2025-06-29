import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import "./PantryPage.css";
import Footer from "../../Footer";

interface PantryItem {
  id: string;
  userId: string;
  name: string;
  expiryDate: Date;
  quantity: number;
  remark?: string;
}

export default function PantryPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expiryDates, setExpiryDates] = useState<string[]>([""]);
  const [remark, setRemark] = useState("");
  const [items, setItems] = useState<PantryItem[]>([]);
  const navigate = useNavigate();

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
            quantity: d.quantity,
            remark: d.remark || "",
          };
        });
        setItems(data);
      });
    });
    return () => stopPantry();
  }, []);

  const resetForm = () => {
    setName("");
    setQuantity(1);
    setExpiryDates([""]);
    setRemark("");
    setEditingItem(null);
    setShowPopup(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || name.trim() === "" || expiryDates[0].trim() === "") return;

    try {
      const currentUser = auth.currentUser.uid;

      if (editingItem) {
        const originalDate = editingItem.expiryDate.toISOString().split("T")[0];
        if (expiryDates.length === 1 && expiryDates[0] === originalDate) {
          await updateDoc(doc(db, "pantry", editingItem.id), {
            name,
            expiryDate: Timestamp.fromDate(new Date(expiryDates[0])),
            quantity,
            remark,
          });
        } else {
          await deleteDoc(doc(db, "pantry", editingItem.id));
          for (const date of expiryDates) {
            if (!date.trim()) continue;
            await addDoc(collection(db, "pantry"), {
              userId: currentUser,
              name,
              expiryDate: Timestamp.fromDate(new Date(date)),
              quantity,
              remark,
            });
          }
        }
      } else {
        for (const date of expiryDates) {
          if (!date.trim()) continue;
          await addDoc(collection(db, "pantry"), {
            userId: currentUser,
            name,
            expiryDate: Timestamp.fromDate(new Date(date)),
            quantity,
            remark,
          });
        }
      }

      resetForm();
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const startEdit = (item: PantryItem) => {
    setName(item.name);
    setQuantity(item.quantity);
    setExpiryDates([item.expiryDate.toISOString().split("T")[0]]);
    setRemark(item.remark || "");
    setEditingItem(item);
    setShowPopup(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "pantry", id));
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleConsume = async (item: PantryItem) => {
    if (item.quantity > 1) {
      await updateDoc(doc(db, "pantry", item.id), {
        quantity: item.quantity - 1,
      });
    } else {
      await deleteDoc(doc(db, "pantry", item.id));
    }
  };

  const updateDate = (index: number, value: string) => {
    const updated = [...expiryDates];
    updated[index] = value;
    setExpiryDates(updated);
  };

  const addNewDate = () => setExpiryDates([...expiryDates, ""]);

  const removeDate = (index: number) => {
    if (expiryDates.length === 1) return;
    const updated = expiryDates.filter((_, i) => i !== index);
    setExpiryDates(updated);
  };

  return (
    <div className="pantryPage">
      <div className="pantryContent">
        <div className="pantryHeader">
          <button className="backBtn" onClick={() => navigate(-1)}>Back</button>
          <div className="titleGroup">
            <h1 className="pageTitle">My Inventory 🥐🥬🥛🍉🍰🍭</h1>
            <p className="pageSubtitle">Track expiry dates, reduce waste, save money!</p>
          </div>
          <button className="openPopupBtn" onClick={() => setShowPopup(true)}>➕ Add Item</button>
        </div>

        {showPopup && (
          <div className="popupOverlay">
            <div className="popup">
              <h2>{editingItem ? "Edit Item" : "Add New Item"}</h2>
              <form onSubmit={handleSubmit} className="popupForm">
                <label>Food Name</label>
                <input type="text" placeholder="e.g. Bread, Milk, Eggs" value={name} onChange={(e) => setName(e.target.value)} required />

                <label>Quantity</label>
                <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />

                <label>Expiry Date(s)</label>
                {expiryDates.map((date, i) => (
                  <div key={i} className="dateRow">
                    <input type="date" value={date} onChange={(e) => updateDate(i, e.target.value)} required />
                    {expiryDates.length > 1 && (
                      <button type="button" className="removeDateBtn" onClick={() => removeDate(i)}>✖️</button>
                    )}
                  </div>
                ))}
                <button type="button" className="addDateBtn" onClick={addNewDate}>+ Add Date</button>

                <label>Remarks / Notes</label>
                <textarea placeholder="Optional comments or storage info" value={remark} onChange={(e) => setRemark(e.target.value)} />

                <div className="popupButtons">
                  <button type="submit">{editingItem ? "Update" : "Save"}</button>
                  <button type="button" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <p className="noItems">(No items in pantry yet 😔)</p>
        ) : (
          <div className="pantryGrid">
            {items.map((item) => {
              const expiryDate = item.expiryDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const todayDate = new Date();
              todayDate.setHours(0, 0, 0, 0);
              const actualExpiry = new Date(item.expiryDate);
              actualExpiry.setHours(0, 0, 0, 0);
              const daysLeft = Math.floor((actualExpiry.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

              let remindText = "";
              if (daysLeft === 2) remindText = "2 days left";
              else if (daysLeft === 1) remindText = "1 day left";
              else if (daysLeft === 0) remindText = "Expires today"
              else if (daysLeft < 0) remindText = "Expired";
              return (
                <div key={item.id} className={`pantryCard ${daysLeft <= 0 ? 'expiredCard' : ''}`}>
                  {remindText && <div className="reminderTag">{remindText}</div>}
                  <div className="cardBody">
                    <p className="itemName"> 🍓{item.name}</p>
                    <p className="itemExpiry">📅 Expires on {expiryDate}</p>
                    <p className="itemExpiry">📦 Quantity: {item.quantity}</p>
                    {item.remark && <p className="itemRemark">📝 {item.remark}</p>}
                    <div className="buttonBar" style={{ justifyContent: "space-between" }}>
                      <button className="btn consumed" onClick={() => handleConsume(item)}> Consumed</button>
                      <button className="btn edit" onClick={() => startEdit(item)}> Edit</button>
                      <button className={`btn donate ${daysLeft < 0 ? 'unavailable' : ''}`}
                        disabled={daysLeft < 0} onClick={() => {
                          if (daysLeft >= 0) {
                            navigate("/exchange", { state: { item } });
                          }
                        }}>Donate</button>
                      <button className="btn remove" onClick={() => handleDelete(item.id)}> Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        <Footer/>
    </div>
  );
}











    