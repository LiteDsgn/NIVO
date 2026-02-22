# Figma UI Styling & Background Rules

When creating or modifying the UI for this Figma plugin, you must adhere to strict rules for background colors and element layering. This prevents elements from washing out, blending into each other, or breaking when transitioning between Figma's Light and Dark themes.

## 1. Never Hardcode Colors
**Never** use raw Tailwind colors (e.g., `bg-white`, `bg-gray-100`, `text-black`) for the UI structure. Always use the predefined `--figma-color-*` CSS variables wrapped in Tailwind classes (e.g., `bg-figma-bg`, `text-figma-text`). This ensures the plugin respects the user's active Figma theme (Light/Dark).

## 2. Background Layering Strategy
When placing elements inside each other, you must alternate background layers to create depth. **Never place a `bg-figma-bg` element directly inside another `bg-figma-bg` container without a border or shadow, and never nest `bg-figma-bg-secondary` inside `bg-figma-bg-secondary`.**

### Level 0: The Base (Canvas)
*   **Class:** `bg-figma-bg`
*   **Use case:** The main canvas of the application (e.g., the Chat timeline background, the overarching app body).

### Level 1: Elevated Panels (Containers & Trays)
*   **Class:** `bg-figma-bg-secondary`
*   **Use case:** Sections of UI that sit on top of the base canvas to group related items. Examples include the bottom chat input tray, settings section blocks, or sidebars.
*   **Rule:** These should usually have a `border-figma-border` to define their edge against the base canvas.

### Level 2: Interactive/Foreground Elements (Inside Level 1)
*   **Class:** `bg-figma-bg` (with `border-figma-border` and optionally `shadow-sm`)
*   **Use case:** Elements that sit *inside* an Elevated Panel (Level 1) that the user needs to interact with directly. Examples include the `textarea` input box inside the input tray, or selection context chips (`QuickActions`).
*   **Rule:** Because the tray is already `secondary` (gray), making the input box `bg-figma-bg` (pure white/pure dark) pulls it forward and makes it look like an actionable text field or button.

### Level 3: Overlays & Popups
*   **Class:** `bg-figma-bg` (with `shadow-figma-menu` and `border-figma-border`) OR `bg-figma-bg-inverse` (for tooltips)
*   **Use case:** Dropdowns, menus (like the model selector), and tooltips. These must sit on top of everything and cast a shadow.

## 3. The "Chat Input Background" Bug Checklist
If the chat input or sticky elements look wrong or blend into the background, check:
1.  **Is the wrapper correctly separated?** The wrapper holding the input should be `bg-figma-bg-secondary border-t border-figma-border`.
2.  **Is the input field correctly separated?** The `textarea` container *inside* the wrapper should be `bg-figma-bg border border-figma-border rounded-lg` so it pops out from the secondary wrapper.
3.  **Are external floating elements styled?** If elements (like `QuickActions`) sit *outside* the tray on the base `bg-figma-bg` canvas, they must be styled as an action group (e.g., `bg-figma-bg-secondary` or given borders) so they don't blend into the plain canvas.

## 4. Interactive States
*   **Hover:** Use `hover:bg-figma-bg-hover` for list items, text buttons, or icon buttons.
*   **Brand Actions:** Primary buttons (like 'Send') should use `bg-figma-bg-brand text-figma-text-onbrand`. For hover states: `hover:bg-figma-bg-brand-hover`. For press states: `active:scale-95`.
*   **Disabled:** Use `disabled:bg-figma-bg-pressed disabled:text-figma-text-secondary`.
