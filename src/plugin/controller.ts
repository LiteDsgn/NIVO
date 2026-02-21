figma.showUI(__html__, { width: 360, height: 600, themeColors: true });

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
    if (nodeData.fillStyleId) {
      try {
        await figma.importStyleByKeyAsync(nodeData.fillStyleId).catch(() => { });
        frame.fillStyleId = nodeData.fillStyleId;
      } catch (e) {
        console.log("Could not apply fillStyleId", e);
      }
    }
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
    if (nodeData.fillStyleId) {
      try {
        await figma.importStyleByKeyAsync(nodeData.fillStyleId).catch(() => { });
        text.fillStyleId = nodeData.fillStyleId;
      } catch (e) { console.log("Could not apply text fillStyleId", e); }
    }
    if (nodeData.textStyleId) {
      try {
        await figma.importStyleByKeyAsync(nodeData.textStyleId).catch(() => { });
        text.textStyleId = nodeData.textStyleId;
      } catch (e) { console.log("Could not apply textStyleId", e); }
    }
    parent.appendChild(text);

  } else if (nodeData.type === 'RECTANGLE') {
    const rect = figma.createRectangle();
    node = rect;
    rect.name = nodeData.name || "Rectangle";
    if (nodeData.width) rect.resize(nodeData.width, nodeData.height);
    if (nodeData.fills) rect.fills = nodeData.fills;
    if (nodeData.fillStyleId) {
      try {
        await figma.importStyleByKeyAsync(nodeData.fillStyleId).catch(() => { });
        rect.fillStyleId = nodeData.fillStyleId;
      } catch (e) { console.log("Could not apply rect fillStyleId", e); }
    }
    if (nodeData.cornerRadius) rect.cornerRadius = nodeData.cornerRadius;
    parent.appendChild(rect);
  } else {
    // Fallback for unknown types (or just skip)
    return;
  }

  return node;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeNode(node: SceneNode): any {
  const common = {
    id: node.id,
    type: node.type,
    name: node.name,
  };

  let specific = {};

  if ('width' in node) {
    specific = { ...specific, width: node.width, height: node.height };
  }

  if ('fills' in node && node.fills !== figma.mixed) {
    specific = { ...specific, fills: (node.fills as readonly Paint[]).filter(p => p.type === 'SOLID') };
  }

  if ('cornerRadius' in node && node.cornerRadius !== figma.mixed) {
    specific = { ...specific, cornerRadius: node.cornerRadius };
  }

  if (node.type === 'FRAME') {
    specific = {
      ...specific,
      layoutMode: node.layoutMode,
      primaryAxisSizingMode: node.primaryAxisSizingMode,
      counterAxisSizingMode: node.counterAxisSizingMode,
      itemSpacing: node.itemSpacing,
      padding: {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft,
      },
      children: node.children.map(child => serializeNode(child))
    };
  } else if (node.type === 'TEXT') {
    specific = {
      ...specific,
      characters: node.characters,
      fontSize: node.fontSize !== figma.mixed ? node.fontSize : 12,
    };
    if (node.fontName !== figma.mixed) {
      specific = { ...specific, fontWeight: node.fontName.style };
    }
  }

  return { ...common, ...specific };
}

// Helper to get local variables and styles
async function getDesignSystem() {
  const paintStyles = figma.getLocalPaintStyles().map(style => ({
    id: style.key, // Use key for persistent reference across files if possible, but id is local
    name: style.name,
    type: 'PAINT',
    paints: style.paints
  }));

  const textStyles = figma.getLocalTextStyles().map(style => ({
    id: style.key,
    name: style.name,
    type: 'TEXT',
    fontName: style.fontName,
    fontSize: style.fontSize
  }));

  // Variables are a bit more complex, let's start with Styles first as they are easier to map
  // for basic generation.

  return { paintStyles, textStyles };
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-ui-from-json') {
    const structure = msg.structure;

    // If we have an existing selection ID to update/replace
    if (msg.replaceNodeId) {
      const nodeToReplace = figma.getNodeById(msg.replaceNodeId);
      if (nodeToReplace) {
        const parent = nodeToReplace.parent;
        if (parent) {
          // Create new node
          let newNode;
          if (Array.isArray(structure)) {
            // Should not happen for replacement usually, but handle it
            // Just take the first one or create a group? 
            // For simplicity, assume single root for replacement
            newNode = await createNode(structure[0], parent);
          } else {
            newNode = await createNode(structure, parent);
          }

          if (newNode) {
            // Position it where the old one was
            if ('x' in nodeToReplace && 'x' in newNode) {
              newNode.x = nodeToReplace.x;
              newNode.y = nodeToReplace.y;
            }
            // Remove old node
            nodeToReplace.remove();

            figma.currentPage.selection = [newNode];
          }
        }
      }
      figma.ui.postMessage({ type: 'generation-complete', status: 'success' });
      return;
    }

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

  } else if (msg.type === 'get-selection-context') {
    const selection = figma.currentPage.selection;
    const designSystem = await getDesignSystem();

    let context = null;
    if (selection.length > 0) {
      const rootNode = selection[0];
      context = serializeNode(rootNode);
    }

    figma.ui.postMessage({
      type: 'selection-context-response',
      context: context,
      designSystem: designSystem,
      requestId: msg.requestId
    });
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

function postSelection() {
  const selection = figma.currentPage.selection;
  const simplifiedSelection = selection.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type
  }));
  figma.ui.postMessage({ type: 'selection-changed', selection: simplifiedSelection });
}

figma.on('selectionchange', postSelection);
postSelection();