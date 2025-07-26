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
import Tesseract from 'tesseract.js'; 

interface PantryItem {
  id: string;
  userId: string;
  name: string;
  expiryDate: Date;
  quantity: number;
  remark?: string;
  dateAdded: Timestamp;
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
  const [formData, setFormData] = useState({
    name: "",
    expiryDate: ""
  });


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
            dateAdded: d.dateAdded || Timestamp.now()
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
    const now = new Date();
    now.setHours(0, 0, 0, 0); 

    for (const dateStr of expiryDates) {
      const inputDate = new Date(dateStr);

      if (isNaN(inputDate.getTime())) {
        alert("One of the expiry dates is invalid.");
        return;
      }

      if (inputDate.getFullYear() < 2025) {
        alert("Expiry date cannot be before the year 2025.");
        return;
      }
    }

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
            dateAdded: Timestamp.now()
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
            dateAdded: Timestamp.now()
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
    const user = auth.currentUser;
    if (!user) return;
    if (item.quantity > 1) {
      await updateDoc(doc(db, "pantry", item.id), {
        quantity: item.quantity - 1,
      });
    } else {
      await deleteDoc(doc(db, "pantry", item.id));
    }
    await addDoc(collection(db, "consumedLogs"), {
      userId: user.uid,
      name: item.name,
      consumedAt: Timestamp.now(),
    });
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


type FormDataType = {
  name: string;
  expiryDate: string;
};

const handleOCRScan = async (
  e: React.ChangeEvent<HTMLInputElement>,
  field: 'name' | 'expiry'
) => {
  const apiKey = 'AIzaSyAa7nX3CxpcdXunL9IYIIChPLAhU9itrc8';
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const rawText: string = await detectText(file, apiKey);
    console.log(`Raw OCR Text:`, rawText);

    if (field === 'name') {
      const lines = rawText
        .split('\n')
        .map(line => line.trim())
        .filter(line =>
          /^[A-Za-z0-9\s\-]+$/.test(line) &&           // no weird symbols
          line.length >= 3 &&
          line.length <= 30 &&
          !line.toLowerCase().includes("exp") &&
          !line.toLowerCase().includes("mfg") &&
          !line.toLowerCase().includes("best") &&
          !line.toLowerCase().includes("lot") &&
          !line.toLowerCase().includes("reg") &&
          !line.toLowerCase().includes("getty") &&
          !line.toLowerCase().includes("dreamstime")
        );

      const mostReadable = lines[0] || '';
      if (mostReadable) {
        setName(mostReadable);
      } else {
        alert("Couldn’t detect food name. Try clearer image without clutter.");
      }

    } else if (field === 'expiry') {
      // Try ALL date-like patterns, not just one
      const allMatches = [...rawText.matchAll(/\d{2,4}[\/\-\.\s]?\d{2}[\/\-\.\s]?\d{2,4}/g)];

      for (const match of allMatches) {
        const raw = match[0].replace(/\s/g, '');
        const formatted = formatToISO(raw);
        if (formatted && !isNaN(new Date(formatted).getTime())) {
          setExpiryDates([formatted]);
          e.target.value = ''; // reset input for re-use
          return;
        }
      }

      alert("Couldn’t parse any valid expiry date. Try better lighting or clearer text.");
    }
  } catch (err) {
    console.error("OCR Error:", err);
    alert("Something went wrong during OCR.");
  }

  // Allow re-uploading same file again
  e.target.value = '';
};








function formatToISO(dateStr: string): string {
  const parts = dateStr.split(/[\/\-\.\s]/);
  if (parts.length !== 3) return "";

  let [a, b, c] = parts;

  // Ensure numbers
  if (!/^\d+$/.test(a) || !/^\d+$/.test(b) || !/^\d+$/.test(c)) return "";

  // Expand 2-digit year
  if (c.length === 2) c = "20" + c;

  // Try DD/MM/YYYY (if day <= 31 and month <= 12)
  const d1 = Number(a), m1 = Number(b);
  if (d1 <= 31 && m1 <= 12) {
    return `${c}-${m1.toString().padStart(2, '0')}-${d1.toString().padStart(2, '0')}`;
  }

  // Try MM/DD/YYYY (if month <= 12 and day <= 31)
  const d2 = Number(b), m2 = Number(a);
  if (d2 <= 31 && m2 <= 12) {
    return `${c}-${m2.toString().padStart(2, '0')}-${d2.toString().padStart(2, '0')}`;
  }

  return "";
}


function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function detectText(file: File, apiKey: string) {
  const base64 = await toBase64(file);
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: 'TEXT_DETECTION' }]
          }
        ]
      })
    }
  );

  const result = await response.json();
  const text = result.responses?.[0]?.fullTextAnnotation?.text || '';
  return text;
}




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
                    <input type="date" value={date} onChange={(e) => updateDate(i, e.target.value)} required min="2025-01-01" max="2100-12-31"/>
                    {expiryDates.length > 1 && (
                      <button type="button" className="removeDateBtn" onClick={() => removeDate(i)}>✖️</button>
                    )}
                  </div>
                ))}
                <button type="button" className="addDateBtn" onClick={addNewDate}>+ Add Date</button>

                <label>Remarks / Notes</label>
                <textarea placeholder="Optional comments or storage info" value={remark} onChange={(e) => setRemark(e.target.value)} />
                
                <label>Fill up with OCR</label>
                <div className="scanButtons">
                <button
                  type="button"
                  className="scanBtn"
                  onClick={() => document.getElementById("scanName")?.click()}
                  title="Scans only clear printed labels like 'OREO' or 'Bread' — works best with centered, bold text"
                >
                  📸 Scan Food Name
                </button>

                <button
                  type="button"
                  className="scanBtn"
                  onClick={() => document.getElementById("scanExpiry")?.click()}
                  title="Scans expiry labels like 'EXP: 2025-08-10' — only works if text is printed clearly with good contrast"
                >
                  📆 Scan Expiry Date
                </button>

                <input type="file" id="scanName" accept="image/*" style={{ display: "none" }} onChange={(e) => handleOCRScan(e, "name")} />
                <input type="file" id="scanExpiry" accept="image/*" style={{ display: "none" }} onChange={(e) => handleOCRScan(e, "expiry")} />
              </div>
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
                            navigate("/exchange", { state: { 
                              foodName: item.name,
                              quantity: item.quantity,
                              expiryDate: item.expiryDate.toISOString().split("T")[0],
                              remark: item.remark,
                             } });
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











    