figma.showUI(__html__, { width: 360, height: 600 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createNode(nodeData: any, parent: BaseNode & ChildrenMixin) {
  let node: SceneNode;

  if (nodeData.type === 'FRAME') {
    const frame = figma.createFrame();
    node = frame;
    frame.name = nodeData.name || "Frame";
    if (nodeData.width) frame.resize(nodeData.width, nodeData.height);
    if (nodeData.layoutMode) frame.layoutMode = nodeData.layoutMode;
    if (nodeData.itemSpacing) frame.itemSpacing = nodeData.itemSpacing;
    if (nodeData.padding) {
      frame.paddingTop = nodeData.padding.top;
      frame.paddingRight = nodeData.padding.right;
      frame.paddingBottom = nodeData.padding.bottom;
      frame.paddingLeft = nodeData.padding.left;
    }
    if (nodeData.fills) frame.fills = nodeData.fills;
    if (nodeData.cornerRadius) frame.cornerRadius = nodeData.cornerRadius;

    // Default primary axis sizing to hug if it has children and layout mode
    if (nodeData.layoutMode && nodeData.layoutMode !== "NONE") {
      frame.primaryAxisSizingMode = "AUTO";
      frame.counterAxisSizingMode = "AUTO";
    }

    if (nodeData.children) {
      for (const childData of nodeData.children) {
        await createNode(childData, frame);
      }
    }
    parent.appendChild(frame);

  } else if (nodeData.type === 'TEXT') {
    const fontStyle = nodeData.fontWeight || "Regular";
    try {
      await figma.loadFontAsync({ family: "Inter", style: fontStyle });
    } catch {
      // Fallback to Regular if the requested style isn't available
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    }
    const text = figma.createText();
    node = text;
    text.name = nodeData.name || "Text";
    text.fontName = { family: "Inter", style: fontStyle };
    text.characters = nodeData.characters || "Text";
    if (nodeData.fontSize) text.fontSize = nodeData.fontSize;
    if (nodeData.fills) text.fills = nodeData.fills;
    parent.appendChild(text);

  } else if (nodeData.type === 'RECTANGLE') {
    const rect = figma.createRectangle();
    node = rect;
    rect.name = nodeData.name || "Rectangle";
    if (nodeData.width) rect.resize(nodeData.width, nodeData.height);
    if (nodeData.fills) rect.fills = nodeData.fills;
    if (nodeData.cornerRadius) rect.cornerRadius = nodeData.cornerRadius;
    parent.appendChild(rect);
  } else {
    // Fallback for unknown types (or just skip)
    return;
  }

  return node;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-ui-from-json') {
    const structure = msg.structure;

    // Create a container frame for the generated content if the root isn't a frame
    // Or just start processing the root node.
    // Let's assume the root is a Frame as per our prompt instructions.

    try {
      if (Array.isArray(structure)) {
        // If it returns a list of nodes
        const nodes: SceneNode[] = [];
        for (const nodeData of structure) {
          const node = await createNode(nodeData, figma.currentPage);
          if (node) nodes.push(node);
        }
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
      } else {
        // Single root node
        const node = await createNode(structure, figma.currentPage);
        if (node) {
          figma.currentPage.selection = [node];
          figma.viewport.scrollAndZoomIntoView([node]);
        }
      }

      figma.ui.postMessage({ type: 'generation-complete', status: 'success' });
    } catch (err) {
      console.error("Error creating nodes:", err);
      figma.ui.postMessage({ type: 'generation-error', message: String(err) });
    }

  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};