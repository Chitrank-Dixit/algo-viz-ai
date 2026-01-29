
import { GoogleGenAI } from "@google/genai";
import { AlgorithmName, SimulationStep } from "../types";
import { ALGORITHMS } from "../lib/algorithms";

// Always use process.env.API_KEY directly for initialization as per @google/genai guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExplanation = async (
  algorithm: AlgorithmName,
  step: SimulationStep | null,
  context: string
): Promise<string> => {
  try {
    const algoDef = ALGORITHMS[algorithm];
    const pseudocode = algoDef?.pseudoCode || "N/A";
    const complexityInfo = algoDef?.complexity ? `Time: ${algoDef.complexity.time}, Space: ${algoDef.complexity.space}` : "N/A";

    const prompt = `
      You are an expert Computer Science instructor and Data Structures & Algorithms specialist.
      
      Algorithm/DS: ${algorithm}
      Algorithm Pseudocode:
      ${pseudocode}
      
      Complexity Info: ${complexityInfo}
      
      Current Step Description: ${step ? step.description : 'Initial state'}
      Current Data State: ${step ? JSON.stringify(step.data.slice(0, 10)) + (step.data.length > 10 ? '...' : '') : 'N/A'}
      Current Auxiliary Data (Stack/Queue/Merge Array): ${step?.auxiliaryData ? JSON.stringify(step.auxiliaryData) : 'None'}

      User Question/Context: ${context}

      Instructions:
      1. Provide a clear, concise, and beginner-friendly explanation.
      2. If the user asks about **complexity**, you MUST provide a detailed explanation of the **Time** and **Space** complexity. Explain *why* it is O(n^2) or O(n log n) etc., by referencing the loop structure in the pseudocode or the nature of the operations (e.g., dividing the array).
      3. If the user asks about the **current step**, explain WHY the algorithm is doing what it's doing right now, referencing the specific line of logic or pseudocode.
      4. Keep the tone encouraging and educational. 
      5. Do not use Markdown headers (like # or ##). Use bolding or simple bullet points for structure.
      6. Keep response length manageable for a chat window (approx 3-5 sentences unless detail is requested).
    `;

    // Use gemini-3-flash-preview for basic text tasks like educational explanations.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to fetch explanation from Gemini. Please try again.";
  }
};
