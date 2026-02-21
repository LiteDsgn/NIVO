import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing Gemini API Key. Please set VITE_GEMINI_API_KEY in your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateUI(prompt: string, modelName: string = "gemini-2.5-flash", context: unknown = null, designSystem: { paintStyles: unknown, textStyles: unknown } | null = null) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    let systemPrompt = `
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
      - fillStyleId: string (optional, ID of a local paint style)
      - textStyleId: string (optional, ID of a local text style)

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

    if (designSystem) {
      systemPrompt += `
        
        DESIGN SYSTEM (IMPORTANT):
        The user has local styles available. You MUST prioritize using these styles over raw hex codes/fonts.
        
        Available Paint Styles (Colors):
        ${JSON.stringify(designSystem.paintStyles, null, 2)}

        Available Text Styles (Typography):
        ${JSON.stringify(designSystem.textStyles, null, 2)}

        INSTRUCTIONS FOR USING STYLES:
        1. If a generated color matches or is close to a Paint Style, add "fillStyleId": "STYLE_ID" to the node.
        2. If a generated text matches a Text Style (font size, weight), add "textStyleId": "STYLE_ID" to the node.
        3. Do NOT remove "fills" or "fontSize" even if you use a style ID (keep them as fallbacks).
        `;
    }

    let userPrompt = `User Prompt: ${prompt}`;

    if (context) {
      systemPrompt += `
        
        CONTEXT - EXISTING DESIGN:
        The user has selected an existing design. Your task is to MODIFY this design based on the user's request.
        
        Here is the current JSON structure of the selected node:
        ${JSON.stringify(context, null, 2)}
        
        INSTRUCTIONS FOR UPDATE:
        1. Return the FULL JSON structure for the new design.
        2. Keep the same structure where possible, but apply the requested changes.
        3. You can add, remove, or modify nodes.
        4. Do NOT wrap the output in a list if the input was a single object, unless the user asks to duplicate it.
        `;

      userPrompt = `User Prompt (Modify Existing Design): ${prompt}`;
    }

    const result = await model.generateContent([
      systemPrompt,
      userPrompt
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