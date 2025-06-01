import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from '../../firebase';
import {
  addDoc,deleteDoc, doc, collection, 
  onSnapshot, orderBy, query, Timestamp, where
} from "firebase/firestore";
import "./PantryPage.css"

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

//Get user's pantry items from Firestore
    useEffect(() => {
        let stopPantry: () => void = () => {};
        const stopAuth = auth.onAuthStateChanged((user) => {
        if (!user) {
            return;
        }
        const dbsearch = query(
            collection(db, "pantry"),
            where("userId", "==", user.uid),
            orderBy("expiryDate")
        );

        const stopPantry = onSnapshot(dbsearch, (snapshot) => {
            const data: PantryItem[] = snapshot.docs.map((eachD) => {
                const getData = eachD.data();
                return { id: eachD.id, userId: getData.userId, name: getData.name, expiryDate: getData.expiryDate.toDate() };
            });
            changeItems(data);
        });

        return () => { stopPantry();};
    });

    return () => { stopAuth(); };
}, []);


//Add item manually into Firestore
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser || name === "" || expiry === "")
            return;
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
        console.error("Error: ", err);
    }
};

//Delete item from Firestore
const handleRemove = async(id: string) => {
    try {
        await deleteDoc(doc(db, "pantry", id));
    } catch (err) {
        console.error("Error: ", err);
    }
};

    return (
        <div className = "pantryOverview">
            <button className = "pantryBackBtn"
                onClick = {() => navigate(-1)}>← Back</button>
            <form onSubmit = {handleAdd} className = "pantryForm">
                <input 
                    type = "text"
                    placeholder = "Food Name"
                    value = {name}
                    onChange = {(e) => changeName(e.target.value)}
                />
                <input
                    type = "date"
                    value = {expiry}
                    onChange = {(e) => changeExpiry(e.target.value)}
                />
                <button type = "submit">Add</button>
            </form>
        
        <h1 className = "pantryHeading">My Inventory 🍽</h1>
        {items.length === 0 ? (<p className = "noItemText">(No items in pantry yet😔)</p>
            ):(
                <div className = "pantryList">
                    {items.map((item) => {
                        const expiryDateObj = item.expiryDate;
                        const expiryDate = expiryDateObj.toLocaleDateString(
                            "en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            });
                        const currentDay = new Date();
                        const timeDiff = expiryDateObj.getTime() - currentDay.getTime();
                        const timeCal = (1000 * 60 * 60 * 24)
                        const daysLeft = Math.floor(timeDiff/ timeCal);

                let remindText = "";
                if (daysLeft === 3) {
                    remindText = "3 days left";
                } else if (daysLeft === 2) {
                    remindText = "2 days left";
                } else if (daysLeft === 1) {
                    remindText = "1 day left";
                } else if (daysLeft <= 0) {
                    remindText = "Expired"
                }

                return (
                    <div key={item.id} className="pantryItemBox">
                        <button className="pantryDelete"
                            onClick={() => handleRemove(item.id)}>
                        ×</button>
                        {remindText && (
                            <div className = "expiryReminder">
                                {remindText}
                            </div>
                        )}
                        <div className="pantryBody">
                            <p className="pantryName">{item.name}</p>
                            <p className= "pantryExpiry">Expires on {expiryDate}</p>
                        </div>
                    </div>
                    );
                })}
            </div>
            )}
        </div>
    );
}


    