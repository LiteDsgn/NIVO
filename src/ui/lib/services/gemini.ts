import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    if (!API_KEY) {
      throw new Error("Missing Gemini API Key. Please set VITE_GEMINI_API_KEY in your .env file and rebuild.");
    }
    _genAI = new GoogleGenerativeAI(API_KEY);
  }
  return _genAI;
}

export async function generateUI(prompt: string, modelName: string = "gemini-2.5-flash", context: unknown = null, designSystem: { paintStyles: unknown, textStyles: unknown, components?: unknown[] } | null = null, settings: { brandContext?: string; enforceWCAG?: boolean } | null = null) {
  try {
    const model = getGenAI().getGenerativeModel({ model: modelName });

    let systemPrompt = `
      You are an expert UI designer and Figma plugin assistant.
      Your task is to generate a JSON structure that represents a Figma design based on the user's prompt.
      
      The JSON structure should be a list of nodes.
      Each node should have:
      - type: "FRAME" | "TEXT" | "RECTANGLE" | "ELLIPSE" | "INSTANCE"
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
      - componentKey: string (optional, KEY of a local component to use as an instance)
      - image: string (optional, description of image content for placeholder, e.g. "avatar of a smiling woman")

      Example Output with Component:
      {
        "type": "FRAME",
        "name": "Card",
        ...
        "children": [
          {
            "type": "INSTANCE",
            "name": "Primary Button",
            "componentKey": "a1b2c3d4e5f6...",
            "width": 120,
            "height": 40
          }
        ]
      }

      Example Output:
      {
        "type": "FRAME",
        "name": "Card",
        "width": 300,
        "height": 200,
        ...
        "children": [
          {
            "type": "RECTANGLE",
            "name": "Cover Image",
            "width": 300,
            "height": 150,
            "image": "mountain landscape at sunset"
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

        Available Components (IMPORTANT):
        ${designSystem.components ? JSON.stringify(designSystem.components, null, 2) : "[]"}

        INSTRUCTIONS FOR USING STYLES & COMPONENTS:
        1. If a generated color matches or is close to a Paint Style, add "fillStyleId": "STYLE_ID" to the node.
        2. If a generated text matches a Text Style (font size, weight), add "textStyleId": "STYLE_ID" to the node.
        3. Do NOT remove "fills" or "fontSize" even if you use a style ID (keep them as fallbacks).
        4. If the user asks for a common UI element (like a Button, Input, Avatar, Icon) and a matching Component exists in the list above:
           - Use type: "INSTANCE"
           - Set "componentKey": "COMPONENT_ID" (use the 'id' field from the component list)
           - Do NOT add children to the instance (unless you are sure they are overridable).
           - Resize it to match the component's width/height if appropriate.
        5. If the user asks for an image, add an "image" property with a short description (e.g., "portrait of a doctor", "modern building").
           - Use type: "RECTANGLE" or "ELLIPSE" for the image container.
           - Still include a solid fill as a fallback background.
        `;
    }

    // Inject user settings (brand context, WCAG)
    if (settings) {
      if (settings.brandContext && settings.brandContext.trim()) {
        systemPrompt += `
        
        BRAND CONTEXT (Apply to ALL designs):
        ${settings.brandContext.trim()}
        `;
      }
      if (settings.enforceWCAG) {
        systemPrompt += `
        
        ACCESSIBILITY REQUIREMENT:
        You MUST ensure all designs meet WCAG AAA standards:
        - Text contrast ratio must be at least 7:1 for normal text and 4.5:1 for large text.
        - Use sufficiently large font sizes (minimum 12px).
        - Ensure interactive elements have clear visual states.
        `;
      }
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