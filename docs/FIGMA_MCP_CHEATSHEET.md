# Figma MCP Cheatsheet

Quick reference for using the Figma Model Context Protocol (MCP) to convert designs into code.

---

## Prerequisites

1. **Figma Desktop App** – MCP connects to the desktop app, not the browser.
2. **File open** – Your design system file must be open in Figma.
3. **Node selected** (optional) – For node-specific tools, select a frame/component in the canvas, or provide a node ID.

---

## Getting a Node ID

| Source | Format | Example |
|-------|--------|---------|
| Figma URL | `?node-id=123-456` | `1:2` (use colon, not hyphen) |
| Right-click in Figma | Copy link → extract from URL | `https://figma.com/design/abc123/File?node-id=1-2` → `1:2` |
| Page-level | Use page ID (e.g. `0:1`) | For full page context |

---

## MCP Tools Overview

| Tool | Purpose | When to use |
|------|---------|-------------|
| `get_design_context` | Generate UI code from a node | Convert frames/components to React/HTML |
| `get_variable_defs` | Get design tokens (colors, spacing, etc.) | Extract variables for tokens file |
| `get_screenshot` | Capture node as image | Visual reference |
| `get_metadata` | XML structure (IDs, names, sizes) | Explore hierarchy before code gen |
| `create_design_system_rules` | Generate design system rules | Set up `.cursor/rules` or CLAUDE.md |

---

## Step-by-Step Workflow

### 1. Extract design tokens

```
1. Open Figma → select a frame that uses variables
2. Call: get_variable_defs (nodeId empty = current selection)
3. Output: { "color/primary": "#0066FF", "spacing/md": "16px", ... }
4. Create: src/tokens/design-tokens.js or CSS variables
```

### 2. Convert a component to code

```
1. Select the component/frame in Figma
2. Call: get_design_context
   - clientLanguages: "javascript,typescript"
   - clientFrameworks: "react"
   - artifactType: "REUSABLE_COMPONENT" or "COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN"
3. Use the generated code as a starting point
4. Replace hardcoded values with your tokens
```

### 3. Convert a full screen

```
1. Select the screen/frame
2. Call: get_design_context
   - artifactType: "WEB_PAGE_OR_APP_SCREEN"
   - taskType: "CREATE_ARTIFACT"
3. Refactor into smaller components as needed
```

### 4. Explore structure first

```
1. Call: get_metadata (nodeId = "" for selection, or "0:1" for page)
2. Review XML for node IDs and hierarchy
3. Call get_design_context on specific node IDs
```

---

## Parameters Quick Reference

**get_design_context**
- `nodeId` – e.g. `"123:456"` or `""` for current selection
- `clientLanguages` – `"javascript,typescript"`
- `clientFrameworks` – `"react"`, `"vue"`, etc.
- `artifactType` – `DESIGN_SYSTEM` | `REUSABLE_COMPONENT` | `WEB_PAGE_OR_APP_SCREEN` | `COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN`
- `taskType` – `CREATE_ARTIFACT` | `CHANGE_ARTIFACT` | `DELETE_ARTIFACT`

**get_variable_defs**
- `nodeId` – `""` or specific ID
- Returns: `{ "variable/name": "value" }`

---

## Tips

- **Empty response?** Ensure Figma desktop is open, file is loaded, and a node is selected.
- **Branch URLs** – For branch links, use the branch key as the file key.
- **Tokens** – Figma variables map to design tokens; create a single source of truth (JS/CSS).
- **Iterate** – Use `get_screenshot` to compare generated UI with the design.

---

## Example: Ask Cursor

> "Use Figma MCP: get the design context for my currently selected button component and create a React component in `src/components/Button.jsx`"

> "Extract variable definitions from my selected frame and create a tokens file at `src/tokens/colors.js`"
