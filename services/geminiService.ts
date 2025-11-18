import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A creative and relevant title for the quiz."
    },
    questions: {
      type: Type.ARRAY,
      description: "An array of quiz questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: {
            type: Type.STRING,
            description: "The text of the question."
          },
          options: {
            type: Type.ARRAY,
            description: "An array of 4 possible answers as strings.",
            items: {
              type: Type.STRING
            }
          },
          correctAnswer: {
            type: Type.STRING,
            description: "The correct answer, which must exactly match one of the items in the 'options' array."
          },
          explanation: {
            type: Type.STRING,
            description: "A brief, professor-like explanation for why the correct answer is correct."
          }
        },
        required: ["questionText", "options", "correctAnswer", "explanation"]
      }
    }
  },
  required: ["title", "questions"]
};

export const generateQuiz = async (topic: string, numberOfQuestions: number): Promise<Quiz> => {
  const prompt = `Create a quiz about ${topic} with exactly ${numberOfQuestions} multiple-choice questions. Each question must have exactly 4 options. For each question, also provide a brief but insightful explanation for why the correct answer is correct, as if a professor were explaining it. The response must be a JSON object that strictly adheres to the provided schema. The 'correctAnswer' field for each question must be an exact string match to one of the provided options.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    const jsonText = response.text.trim();
    const quizData = JSON.parse(jsonText);
    
    // Basic validation
    if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid quiz format received from API.");
    }
    
    return quizData as Quiz;

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate the quiz. The model may have returned an invalid format. Please try again.");
  }
};
