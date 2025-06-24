import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { OpenAI } from "openai";
import * as cors from "cors";

admin.initializeApp();

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

const corsHandler = cors({ origin: true });

export const generateRecipe = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const ingredients: string[] = req.body.ingredients || [];

      if (!ingredients.length) {
        res.status(400).json({ error: "No ingredients provided." });
        return;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Suggest a sustainable recipe using: ${ingredients.join(", ")}`,
          },
        ],
      });

      const reply = completion.choices?.[0]?.message?.content || "No recipe ideas found.";
      res.status(200).json({ recipe: reply });
    } catch (err: any) {
      console.error("OpenAI error:", JSON.stringify(err, null, 2));
      res.status(500).json({ error: "Failed to generate recipe." });
    }
  });
});




