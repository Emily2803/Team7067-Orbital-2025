import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import Footer from "./Footer";
import "./CSS/Recipes.css";

interface PantryItem {
  id: string;
  name: string;
  expiryDate: Date;
}

const RECIPE_API_URL =
  "https://us-central1-shelfaware-110f0.cloudfunctions.net/generateRecipe";

const Recipes: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [recipeIdeas, setRecipeIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const pantryQuery = query(
          collection(db, "pantry"),
          where("userId", "==", user.uid)
        );
        onSnapshot(pantryQuery, (snapshot) => {
          const data: PantryItem[] = snapshot.docs.map((doc) => {
            const d = doc.data() as DocumentData;
            return {
              id: doc.id,
              name: d.name,
              expiryDate: d.expiryDate?.toDate(),
            };
          });
          setItems(data);
        });
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchRecipeIdeas = async () => {
    setLoading(true);
    setError("");
    setRecipeIdeas([]);

    try {
      const res = await fetch(RECIPE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: items.map((i) => i.name) }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch recipes from server");
      }

      const data = await res.json();
      const recipeText = data.recipe || "No recipe ideas found.";
      const parsedIdeas = recipeText
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      setRecipeIdeas(parsedIdeas);
    } catch (err: any) {
      console.error("Error fetching recipes:", err);
      setError("⚠️ Unable to generate recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipesPage">
      <div className="contentWrapper">
        <div className="topNav">
          <button className="backBtn" onClick={() => navigate(-1)}> Back</button>
        </div>

        <div className="recipesHeader">
          <h1 className="pageTitle">AI-Powered Recipe Ideas 🍽️</h1>
          <p className="pageSubtitle">Get suggestions based on your pantry ingredients.</p>
          <button
            className="generateBtn"
            onClick={fetchRecipeIdeas}
            disabled={loading || items.length === 0}
          >
            {loading ? "Generating..." : "Suggest Recipes"}
          </button>
        </div>

        {error && <p className="errorText">{error}</p>}

        {recipeIdeas.length > 0 && (
             <div className="recipeTextBlock">
                {recipeIdeas.map((para, index) => (
                    <p key={index}>{para}</p>
                ))}
             </div>
        )}


        {!loading && recipeIdeas.length === 0 && items.length > 0 && (
          <p className="noIdeas">Click "Suggest Recipes" to generate ideas.</p>
        )}

        {!loading && items.length === 0 && (
          <p className="noItems">Your pantry is empty. Add ingredients first!</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Recipes;





