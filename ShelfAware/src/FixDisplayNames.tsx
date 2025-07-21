// FixDisplayNames.tsx
import React from "react";
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export default function FixDisplayNames() {
  const handleFix = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));

    const updates = querySnapshot.docs.map(async (userDoc) => {
      const data = userDoc.data();
      const ref = doc(db, "users", userDoc.id);

      if (!data.displayName && data.name) {
        await updateDoc(ref, {
          displayName: data.name,
        });
        console.log(`✅ Updated ${userDoc.id} with displayName: ${data.name}`);
      }
    });

    await Promise.all(updates);
    alert("✅ All displayNames fixed!");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🔧 Admin Fix Tool</h2>
      <button onClick={handleFix} style={{ padding: "1rem", fontSize: "16px" }}>
        Fix Missing Display Names
      </button>
    </div>
  );
}
