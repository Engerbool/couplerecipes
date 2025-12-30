import { GoogleGenAI } from "@google/genai";
import { Ingredient } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// Helper to keep types consistent
interface RecipeContent {
  ingredients: Ingredient[];
  steps: string[];
}

export const polishRecipeText = async (rawIngredients: string, rawSteps: string): Promise<RecipeContent> => {
  if (!apiKey) {
    console.warn("No API Key available for Gemini.");
    // Fallback simple split if no API key
    return {
      ingredients: rawIngredients.split('\n').filter(Boolean).map(s => ({ name: s, amount: '' })),
      steps: rawSteps.split('\n').filter(Boolean)
    };
  }

  try {
    const prompt = `
      You are a professional chef assistant. 
      I will provide raw text for ingredients and cooking steps.
      Please format them into clean, concise lists. 
      For ingredients, try to separate the name and the quantity if possible. If no quantity is found, leave amount empty.
      Return JSON only.
      
      Raw Ingredients: ${rawIngredients}
      Raw Steps: ${rawSteps}

      Format:
      {
        "ingredients": [{"name": "Item 1", "amount": "100g"}, {"name": "Item 2", "amount": ""}],
        "steps": ["Step 1", "Step 2"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback on error
    return {
      ingredients: rawIngredients.split('\n').filter(Boolean).map(s => ({ name: s, amount: '' })),
      steps: rawSteps.split('\n').filter(Boolean)
    };
  }
};

export const suggestImprovement = async (recipeTitle: string, currentIngredients: Ingredient[], currentSteps: string[], comments: string[]): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot generate suggestions.";

  try {
    // Handle cases where ingredient might be a string (legacy data) or object
    const formattedIngredients = currentIngredients.map(i => {
      if (typeof i === 'string') return i;
      return `${i.name} ${i.amount}`;
    });

    const prompt = `
      I have a recipe called "${recipeTitle}".
      
      Current Ingredients:
      ${formattedIngredients.join(', ')}

      Current Steps:
      ${currentSteps.join(' -> ')}

      Here is the feedback/comments from my partner:
      ${comments.join('\n- ')}

      Based on the feedback, suggest concrete improvements for the next version of this recipe. Keep it encouraging and brief (under 100 words).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No suggestions available.";

  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate suggestions at this time.";
  }
}