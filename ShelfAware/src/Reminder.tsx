import React, { useEffect, useState } from "react";
import { getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import "./CSS/Reminder.css";

const ReminderEnabling: React.FC = () => {
  const [onReminder, setOn] = useState(false);
  const [processing, setProcessing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const uncheck = getAuth().onAuthStateChanged(async (eachUser) => {
      if (!eachUser) {
        navigate("/login");
      } else {
        const database = doc(db, "users", eachUser.uid);
        const getData = await getDoc(database);
        if (getData.exists()) {
          setOn(getData.data().notificationsEnabled || false);
        }
        setProcessing(false);
      }
    });
    return () => uncheck();
  }, [navigate]);

  const toggleNotification = async () => {
    const existingUser = getAuth().currentUser;
    if (!existingUser) return;

    setOn(!onReminder);
    await updateDoc(doc(db, "users", existingUser.uid), {
      notificationsEnabled: !onReminder,
    });
  };

  return (
    <div className="reminderPage">
      <div className="topSide">
        <button className="backBut" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="contentWrapper">
        <div className="bodyContent">
          <h1 className="titleHeading">Expiry Notifications ⏰</h1>
          <p className="descriptionNote">
            Get alerted for your pantry's expiry food!
          </p>

          {processing ? (
            <p>Processing...</p>
          ) : (
            <div className="buttonArea">
              <span className="enableChecker">Email Reminders:</span>
              <button
                onClick={toggleNotification}
                className={`enableButton ${onReminder ? "enableOn" : "enableOff"}`}
              >
                {onReminder ? "ON 🔔" : "OFF 🔕"}
              </button>
            </div>
          )}

          <p className="shortNote">
            Reminders are sent daily at 8am via email if any items are expiring in 3 days.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReminderEnabling;

