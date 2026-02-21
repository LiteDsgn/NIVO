import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing Gemini API Key. Please set VITE_GEMINI_API_KEY in your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateUI(prompt: string, modelName: string = "gemini-2.5-flash") {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = `
      You are an expert UI designer and Figma plugin assistant.
      Your task is to generate a JSON structure that represents a Figma design based on the user's prompt.
      
      The JSON structure should be a list of nodes.
      Each node should have:
      - type: "FRAME" | "TEXT" | "RECTANGLE" | "ELLIPSE"
      - name: string
      - x: number
      - y: number
      - width: number
      - height: number
      - fills: array of { type: "SOLID", color: { r, g, b } } (r,g,b are 0-1)
      - children: array of nodes (recursive)
      - layoutMode: "VERTICAL" | "HORIZONTAL" | "NONE" (for frames)
      - itemSpacing: number (for auto layout)
      - padding: { top, right, bottom, left } (for auto layout)
      - characters: string (for TEXT)
      - fontSize: number (for TEXT)
      - fontWeight: "Regular" | "Bold" (for TEXT)
      - cornerRadius: number (for shapes/frames)

      Example Output:
      {
        "type": "FRAME",
        "name": "Card",
        "width": 300,
        "height": 200,
        "layoutMode": "VERTICAL",
        "itemSpacing": 16,
        "padding": { "top": 24, "right": 24, "bottom": 24, "left": 24 },
        "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }],
        "cornerRadius": 16,
        "children": [
          {
            "type": "TEXT",
            "name": "Title",
            "characters": "Hello World",
            "fontSize": 24,
            "fontWeight": "Bold",
            "fills": [{ "type": "SOLID", "color": { "r": 0, "g": 0, "b": 0 } }]
          }
        ]
      }

      Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    `;

    const result = await model.generateContent([
      systemPrompt,
      `User Prompt: ${prompt}`
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown code blocks
    const jsonString = text.replace(/```json\n?|\n?```/g, "").trim();

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating UI:", error);
    throw error;
  }
}