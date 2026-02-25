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

export async function generateUI(messages: { role: 'user' | 'assistant', content: string }[], modelName: string = "gemini-2.5-flash", context: unknown = null, designSystem: { paintStyles: unknown, textStyles: unknown, components?: unknown[] } | null = null, settings: { brandContext?: string; enforceWCAG?: boolean; platform?: 'mobile' | 'web'; reasoningMode?: boolean } | null = null) {
  try {
    const isReasoning = settings?.reasoningMode === true;
    const model = getGenAI().getGenerativeModel({
      model: modelName,
      // We removed responseMimeType: "application/json" so the model can always converse
    });

    let systemPrompt = `You are NIVO, an expert AI UI designer embedded in Figma. Generate production-grade, editable Figma designs from text prompts.

# 1. CREATIVE DIRECTION
- **Aesthetic**: Tailor to the prompt (e.g., Luxury=dark/gold/sharp, Playful=pastels/rounded). Never generic.
- **Colors**: Dominant + 1-2 accents + soft neutrals (RGB 0-1). Avoid pure black/white; use tinted near-blacks and off-whites.
- **Typography**: 3+ level hierarchy. Display(32-48px), Headers(20-28px), Body(14-16px), Meta(11-13px).
- **Spacing**: 4px/8px base. Tight(4-8px), Default(12-16px), Section(24-32px), Hero(40-64px).
- **Depth**: Layer background tints, content frames, and accents. Use cornerRadius (0=sharp, 8-12=modern, 999=pill) intentionally.

# 2. AUTO LAYOUT (CRITICAL)
- Frames with children MUST use layoutMode "VERTICAL" or "HORIZONTAL". Avoid absolute positions.
- **Responsive children**: For VERTICAL parents, children use layoutSizingHorizontal "FILL". For HORIZONTAL parents, layoutSizingVertical "FILL".
- Use layoutAlign "STRETCH" or layoutGrow 1 where appropriate.
- **Patterns**:
  * Page Layout: Root VERTICAL (padding 0, children fill horizontal).
  * Nav/Bars: HORIZONTAL.
  * Cards/Hero: VERTICAL with proper padding/radius.

# 3. WORKFLOW
- **CLARIFY**: If the request is vague or lacks details, ask 2-3 brief clarifying questions (e.g., target vibe, key features) via plain text. NEVER return JSON when asking questions.
- **DESIGN**: If context is clear (or "Modify Existing Design" is active for restyles), output ONLY valid JSON wrapped exactly in <UI_JSON>...</UI_JSON>.

# 4. JSON SCHEMA
{
  "type": "FRAME" | "TEXT" | "RECTANGLE" | "ELLIPSE" | "INSTANCE",
  "name": "string (professional naming)",
  "width": number,
  "height": number,
  "fills": [{ "type": "SOLID", "color": { "r": 0-1, "g": 0-1, "b": 0-1 } }],
  "children": [... nested nodes],
  "layoutMode": "VERTICAL" | "HORIZONTAL" | "NONE",
  "primaryAxisSizingMode": "FIXED" | "AUTO",
  "counterAxisSizingMode": "FIXED" | "AUTO",
  "layoutSizingHorizontal": "FIXED" | "HUG" | "FILL" (for children in layout),
  "layoutSizingVertical": "FIXED" | "HUG" | "FILL" (for children in layout),
  "layoutAlign": "MIN" | "CENTER" | "MAX" | "STRETCH" (for children in layout),
  "layoutGrow": number (for children in layout),
  "itemSpacing": number,
  "padding": { "top": n, "right": n, "bottom": n, "left": n },
  "characters": "string (TEXT only)",
  "fontSize": number,
  "fontWeight": "Thin" | "ExtraLight" | "Light" | "Regular" | "Medium" | "SemiBold" | "Bold" | "ExtraBold" | "Black",
  "cornerRadius": number,
  "fillStyleId": "string (optional paint style ID)",
  "textStyleId": "string (optional text style ID)",
  "componentKey": "string (optional for INSTANCE)",
  "image": "string (placeholder description)"
}

# 5. QUALITY CHECKLIST
- No lazy generation: full pages need 15+ nodes with headers, heroism, grids, footers.
- Real copy only (no lorem ipsum). Realistic root block dimensions. Harmonious styles.`;

    if (designSystem) {
      systemPrompt += `\n\n# DESIGN SYSTEM (IMPORTANT)
Prioritize local styles over raw values:
Colors: ${JSON.stringify(designSystem.paintStyles, null, 2)}
Typography: ${JSON.stringify(designSystem.textStyles, null, 2)}
Components: ${designSystem.components ? JSON.stringify(designSystem.components, null, 2) : "[]"}

Rules:
1. Match generated colors/fonts to a Style ID ("fillStyleId", "textStyleId"). Keep "fills"/"fontSize" fallback.
2. For common elements matching UI Components, use type: "INSTANCE" with "componentKey". Do not add children unless overridable. Resize appropriately.
3. For images, use "RECTANGLE"/"ELLIPSE" + "image": "description" + solid fill fallback.`;
    }

    // Inject user settings (brand context, WCAG)
    if (settings) {
      if (settings.brandContext && settings.brandContext.trim()) {
        systemPrompt += `\n\n# BRAND CONTEXT\n${settings.brandContext.trim()}`;
      }
      if (settings.enforceWCAG) {
        systemPrompt += `\n\n# ACCESSIBILITY (WCAG AAA)\n- Text contrast >= 7:1 (4.5:1 large)\n- Font sizes >= 12px\n- Clear interactive states`;
      }
    }

    // Inject platform context
    if (settings?.platform) {
      const isMobile = settings.platform === 'mobile';
      systemPrompt += `\n\n# PLATFORM: ${isMobile ? 'MOBILE' : 'WEB/DESKTOP'}\n`;
      if (isMobile) {
        systemPrompt += `- Viewport: iPhone size for full screens; component size otherwise. Root frames MUST use "FIXED" sizing.\n- Patterns: iOS/Material guidelines, 44x44px touch targets.`;
      } else {
        systemPrompt += `- Viewport: 1280-1440px for full pages. Root frames MUST use "FIXED" sizing with generous padding.\n- Patterns: Modern web (shadcn, Tailwind).`;
      }
    }

    let userPromptContext = `CONVERSATION HISTORY:\n`;
    for (const msg of messages) {
      userPromptContext += `${msg.role === 'user' ? 'USER' : 'ASSISTANT'}: ${msg.content}\n\n`;
    }

    if (context) {
      systemPrompt += `\n\n# EXISTING DESIGN TO MODIFY (JSON)\n${JSON.stringify(context, null, 2)}\n\nInstructions: Return the FULL JSON for the modified design. Keep the original structure where possible unless significant changes are requested. Do NOT wrap single objects in arrays unless explicitly duplicated.`;
      userPromptContext += `(Modify Existing Design active)\n`;
    }


    const result = await model.generateContent([
      systemPrompt,
      userPromptContext
    ]);

    const response = await result.response;
    const text = response.text();

    // Look for <UI_JSON> tags. If present, we have a design.
    // Also extract any text that appears before/after the tags to return to the user.
    const match = text.match(/<UI_JSON>([\s\S]*?)<\/UI_JSON>/);
    if (match && match[1]) {
      // Clean up potential markdown formatting that the AI might sneak inside the tags
      const jsonText = match[1].replace(/```json\n ?|\n ? ```/g, '').trim();
      const conversationalText = text.replace(match[0], '').trim();

      const parsedStruct = JSON.parse(jsonText);
      return {
        type: 'ui',
        structure: parsedStruct,
        text: conversationalText // Return the conversational part alongside the UI so chat can display it
      };
    }

    // No UI tags found, assume it is purely conversational text
    return { type: 'text', text: text.trim() };
  } catch (error) {
    console.error("Error generating UI:", error);
    throw error;
  }
}
