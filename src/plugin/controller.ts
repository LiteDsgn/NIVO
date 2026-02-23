figma.showUI(__html__, { width: 360, height: 600, themeColors: true });

/**
 * Scan all top-level nodes on the current page and find a position
 * to the right of the rightmost node (with a 100px gap).
 */
function findOpenCanvasPosition(): { x: number; y: number } {
  const nodes = figma.currentPage.children;
  if (nodes.length === 0) return { x: 0, y: 0 };

  let maxRight = -Infinity;
  let topAtMaxRight = 0;

  for (const node of nodes) {
    const right = node.x + node.width;
    if (right > maxRight) {
      maxRight = right;
      topAtMaxRight = node.y;
    }
  }

  return { x: Math.round(maxRight + 100), y: Math.round(topAtMaxRight) };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createNode(nodeData: any, parent: BaseNode & ChildrenMixin) {
  let node: SceneNode;

  if (nodeData.type === 'FRAME') {
    const frame = figma.createFrame();
    node = frame;
    frame.name = nodeData.name || "Frame";
    if (nodeData.width && nodeData.height) frame.resize(nodeData.width, nodeData.height);
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

    // Handle Sizing Modes (Hug vs Fixed) and Auto Layout fallbacks
    let appliedLayoutMode = nodeData.layoutMode;

    // Robustness: If AI forgot layoutMode but provided children, default to VERTICAL to prevent overlapping.
    if ((!appliedLayoutMode || appliedLayoutMode === "NONE") && nodeData.children && nodeData.children.length > 0) {
      appliedLayoutMode = "VERTICAL";
    }

    if (appliedLayoutMode && appliedLayoutMode !== "NONE") {
      frame.layoutMode = appliedLayoutMode;

      // Allow JSON to specify sizing modes, default to AUTO (Hug) for children,
      // but if it's the root node (parent is Page), default lateral to FIXED to keep device width.
      const isRoot = parent.type === 'PAGE' || parent.type === 'DOCUMENT';

      frame.primaryAxisSizingMode = nodeData.primaryAxisSizingMode || (isRoot ? (appliedLayoutMode === 'VERTICAL' ? 'AUTO' : 'FIXED') : 'AUTO');
      frame.counterAxisSizingMode = nodeData.counterAxisSizingMode || (isRoot ? (appliedLayoutMode === 'VERTICAL' ? 'FIXED' : 'AUTO') : 'AUTO');
    }

    if (nodeData.children) {
      for (const childData of nodeData.children) {
        await createNode(childData, frame);
      }
    }
    parent.appendChild(frame);

  } else if (nodeData.type === 'INSTANCE') {
    // INSTANCE CREATION
    if (nodeData.componentKey) {
      try {
        const component = await figma.importComponentByKeyAsync(nodeData.componentKey);
        const instance = component.createInstance();
        node = instance;
        instance.name = nodeData.name || instance.name;

        if (nodeData.width && nodeData.height) instance.resize(nodeData.width, nodeData.height);

        // Apply overrides if any (basic ones)
        if (nodeData.layoutMode) instance.layoutMode = nodeData.layoutMode;
        if (nodeData.itemSpacing) instance.itemSpacing = nodeData.itemSpacing;
        if (nodeData.padding) {
          instance.paddingTop = nodeData.padding.top;
          instance.paddingRight = nodeData.padding.right;
          instance.paddingBottom = nodeData.padding.bottom;
          instance.paddingLeft = nodeData.padding.left;
        }

        parent.appendChild(instance);
      } catch (e) {
        console.log("Failed to create instance", e);
        // Fallback to frame
        const frame = figma.createFrame();
        node = frame;
        frame.name = "Missing Component";
        frame.resize(nodeData.width || 100, nodeData.height || 100);
        frame.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]; // Red error box
        parent.appendChild(frame);
      }
    }

  } else if (nodeData.type === 'TEXT') {
    // Map AI font weight names to valid Inter font styles
    const weightMap: Record<string, string> = {
      'Thin': 'Thin',
      'ExtraLight': 'ExtraLight',
      'Light': 'Light',
      'Regular': 'Regular',
      'Medium': 'Medium',
      'SemiBold': 'Semi Bold',
      'Semi Bold': 'Semi Bold',
      'Bold': 'Bold',
      'ExtraBold': 'Extra Bold',
      'Extra Bold': 'Extra Bold',
      'Black': 'Black',
    };
    const rawWeight = nodeData.fontWeight || "Regular";
    const fontStyle = weightMap[rawWeight] || "Regular";
    let loadedStyle = fontStyle;
    try {
      await figma.loadFontAsync({ family: "Inter", style: fontStyle });
    } catch {
      // Fallback to Regular if the requested style isn't available
      loadedStyle = "Regular";
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    }
    const text = figma.createText();
    node = text;
    text.name = nodeData.name || "Text";
    text.fontName = { family: "Inter", style: loadedStyle };
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

  } else if (nodeData.type === 'RECTANGLE' || nodeData.type === 'ELLIPSE') {
    let shape;
    if (nodeData.type === 'ELLIPSE') {
      shape = figma.createEllipse();
    } else {
      shape = figma.createRectangle();
    }
    node = shape;
    shape.name = nodeData.name || (nodeData.type === 'ELLIPSE' ? "Ellipse" : "Rectangle");
    if (nodeData.width && nodeData.height) shape.resize(nodeData.width, nodeData.height);

    // Handle Image Placeholder
    if (nodeData.image) {
      shape.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85 } }];
      shape.name = `[Img] ${nodeData.image}`;
    } else if (nodeData.fills) {
      shape.fills = nodeData.fills;
    }

    if (nodeData.fillStyleId) {
      try {
        await figma.importStyleByKeyAsync(nodeData.fillStyleId).catch(() => { });
        shape.fillStyleId = nodeData.fillStyleId;
      } catch (e) { console.log("Could not apply shape fillStyleId", e); }
    }
    if (nodeData.cornerRadius && nodeData.type === 'RECTANGLE') shape.cornerRadius = nodeData.cornerRadius;
    parent.appendChild(shape);
  } else {
    // Fallback for unknown types (or just skip)
    return;
  }

  // Support FILL / HUG sizing for ALL nodes inside auto-layout parents
  if (node && parent.type !== 'PAGE' && parent.type !== 'DOCUMENT') {
    try {
      // Special logic for TEXT nodes when set to FILL horizontally:
      // They require textAutoResize to be 'HEIGHT' so they wrap text correctly.
      if (node.type === 'TEXT' && nodeData.layoutSizingHorizontal === 'FILL') {
        (node as TextNode).textAutoResize = 'HEIGHT';
      }
      if (nodeData.layoutSizingHorizontal && 'layoutSizingHorizontal' in node) {
        (node as any).layoutSizingHorizontal = nodeData.layoutSizingHorizontal;
      }
      if (nodeData.layoutSizingVertical && 'layoutSizingVertical' in node) {
        (node as any).layoutSizingVertical = nodeData.layoutSizingVertical;
      }
    } catch (e) {
      // FILL is only valid inside auto-layout parents; silently ignore if not applicable
      console.log("layoutSizing skipped for", node.name, e);
    }
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

  const effectStyles = figma.getLocalEffectStyles().map(style => ({
    id: style.key,
    name: style.name,
    type: 'EFFECT',
    effects: style.effects
  }));

  const gridStyles = figma.getLocalGridStyles().map(style => ({
    id: style.key,
    name: style.name,
    type: 'GRID',
    layoutGrids: style.layoutGrids
  }));

  let localVariables: unknown[] = [];
  if (figma.variables && figma.variables.getLocalVariablesAsync) {
    try {
      const allVars = await figma.variables.getLocalVariablesAsync();
      localVariables = allVars.map(v => ({
        id: v.key,
        name: v.name,
        resolvedType: v.resolvedType,
        valuesByMode: v.valuesByMode
      }));
    } catch (e) {
      console.warn("Could not fetch local variables", e);
    }
  }

  // Scan local components
  // We'll limit to first 50 to avoid hitting limits or slowing down too much
  const localComponents = figma.currentPage.findAll(node => node.type === "COMPONENT").slice(0, 50).map((node: ComponentNode) => ({
    id: node.key, // Use key for persistent reference
    name: node.name,
    description: node.description || "",
    width: node.width,
    height: node.height
  }));

  return { paintStyles, textStyles, effectStyles, gridStyles, variables: localVariables, components: localComponents };
}

let currentDraftNodeIds: string[] = [];

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-ui-from-json') {
    const structure = msg.structure;

    // Clear any previous draft if it wasn't accepted/discarded explicitly (edge case)
    currentDraftNodeIds = [];

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
            // Cast nodeToReplace to SceneNode since it has a parent and x/y properties we're accessing
            const sceneNodeToReplace = nodeToReplace as SceneNode;

            // Position it where the old one was
            if ('x' in sceneNodeToReplace && 'x' in newNode) {
              newNode.x = sceneNodeToReplace.x;
              newNode.y = sceneNodeToReplace.y;
            }

            // Maintain layer order (important for Auto Layout)
            const index = parent.children.indexOf(sceneNodeToReplace);
            if (index !== -1) {
              parent.insertChild(index, newNode);
            }

            // Mark as draft
            currentDraftNodeIds.push(newNode.id);
            newNode.setPluginData('isDraft', 'true');
            newNode.name = `[Draft] ${newNode.name}`;

            // Remove old node? 
            // WAIT! If it's a draft, we shouldn't remove the old node yet!
            // We should hide it or just place the new one on top?
            // "In-place edit" implies replacement.
            // If we discard, we want the old one back.
            // So: Hide old node, show new node.
            sceneNodeToReplace.visible = false;
            sceneNodeToReplace.setPluginData('replacedByDraft', newNode.id);

            // We need to track that this draft replaced a specific node
            newNode.setPluginData('draftReplaces', sceneNodeToReplace.id);

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
      const pos = findOpenCanvasPosition();
      const nodes: SceneNode[] = [];
      if (Array.isArray(structure)) {
        // If it returns a list of nodes
        for (const nodeData of structure) {
          const node = await createNode(nodeData, figma.currentPage);
          if (node) {
            node.x = pos.x;
            node.y = pos.y;
            pos.y += node.height + 40; // stack multiple roots vertically
            nodes.push(node);
          }
        }
      } else {
        // Single root node
        const node = await createNode(structure, figma.currentPage);
        if (node) {
          node.x = pos.x;
          node.y = pos.y;
          nodes.push(node);
        }
      }

      // Mark all as draft
      for (const node of nodes) {
        currentDraftNodeIds.push(node.id);
        node.setPluginData('isDraft', 'true');
        node.name = `[Draft] ${node.name}`;
      }

      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);

      figma.ui.postMessage({ type: 'generation-complete', status: 'success' });
    } catch (err) {
      console.error("Error creating nodes:", err);
      figma.ui.postMessage({ type: 'generation-error', message: String(err) });
    }

  } else if (msg.type === 'accept-draft') {
    for (const id of currentDraftNodeIds) {
      const node = figma.getNodeById(id);
      if (node) {
        node.setPluginData('isDraft', ''); // Clear draft flag
        node.name = node.name.replace('[Draft] ', ''); // Remove prefix

        // If this replaced a node, remove the original
        const replacedId = node.getPluginData('draftReplaces');
        if (replacedId) {
          const replacedNode = figma.getNodeById(replacedId);
          if (replacedNode) {
            replacedNode.remove();
          }
        }
      }
    }
    currentDraftNodeIds = [];
    figma.notify("Draft accepted");

  } else if (msg.type === 'discard-draft') {
    for (const id of currentDraftNodeIds) {
      const node = figma.getNodeById(id);
      if (node) {
        // If this replaced a node, restore the original
        const replacedId = node.getPluginData('draftReplaces');
        if (replacedId) {
          const replacedNode = figma.getNodeById(replacedId);
          if (replacedNode && 'visible' in replacedNode) {
            (replacedNode as SceneNode).visible = true;
            replacedNode.setPluginData('replacedByDraft', '');
          }
        }
        node.remove();
      }
    }
    currentDraftNodeIds = [];
    figma.notify("Draft discarded");

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
  } else if (msg.type === 'get-local-library') {
    const designSystem = await getDesignSystem();
    figma.ui.postMessage({
      type: 'local-library-response',
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