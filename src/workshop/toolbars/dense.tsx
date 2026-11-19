import { actionToggleGridMode } from "@excalidraw/excalidraw/actions";
import { getShortcutFromShortcutName } from "@excalidraw/excalidraw/actions/shortcuts";
import {
  boltIcon,
  gridIcon,
  LibraryIcon,
  LockedIcon,
  RedoIcon,
  UndoIcon,
  UnlockedIcon,
} from "@excalidraw/excalidraw/components/icons";
import { t } from "@excalidraw/excalidraw/i18n";
import { getShortcutKey } from "@excalidraw/excalidraw/shortcut";

import type { ReactNode } from "react";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Dense for power users",
  idea: "Every tool in sight, with keyboard shortcuts on the buttons and a strip for frequent canvas actions.",
};

const groups: { label: string; types: ToolbarTool["type"][] }[] = [
  { label: "Select & move", types: ["selection", "lasso", "hand"] },
  {
    label: "Shapes & lines",
    types: ["rectangle", "diamond", "ellipse", "arrow", "line"],
  },
  {
    label: "Create",
    types: ["freedraw", "autoshape", "text", "stickynote", "image"],
  },
  {
    label: "Canvas tools",
    types: ["frame", "embeddable", "bucketfill", "eraser", "laser"],
  },
];

const shortLabels: Partial<Record<ToolbarTool["type"], string>> = {
  selection: "Select",
  lasso: "Lasso",
  hand: "Hand",
  autoshape: "Auto",
  stickynote: "Sticky",
  image: "Image",
  frame: "Frame",
  embeddable: "Embed",
  bucketfill: "Fill",
  laser: "Laser",
};

function ActionButton({
  label,
  icon,
  shortcut,
  onClick,
  pressed,
  disabled,
}: {
  label: string;
  icon: ReactNode;
  shortcut?: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="dense-action"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <span className="dense-icon" aria-hidden="true">
        {icon}
      </span>
      {label}
      {shortcut && <kbd>{shortcut}</kbd>}
    </button>
  );
}

export default function DenseToolbar({
  tools,
  locked,
  toggleLock,
  renderHint,
  openLibrary,
  openCommandPalette,
  undo,
  redo,
  app,
  appState,
}: ToolbarProps) {
  const selectionShortcut = tools.find(
    ({ type }) => type === "selection",
  )?.shortcut;
  const toolGroups = groups.map(({ label, types }) => ({
    label,
    tools: types.flatMap((type) => tools.filter((tool) => tool.type === type)),
  }));
  const ungrouped = tools.filter(
    (tool) => !groups.some(({ types }) => types.includes(tool.type)),
  );
  if (ungrouped.length) {
    toolGroups.push({ label: "Other tools", tools: ungrouped });
  }

  const toggleGrid = () => {
    app.syncActionResult(
      actionToggleGridMode.perform(
        app.scene.getElementsIncludingDeleted(),
        app.state,
      ),
    );
  };

  return (
    <div className="toolbar-dense">
      <style>{styles}</style>
      <div
        className="dense-dock"
        role="group"
        aria-label="Dense drawing toolbar"
      >
        <div className="dense-tools">
          {toolGroups.map(({ label, tools }) => (
            <div
              className="dense-group"
              key={label}
              role="group"
              aria-label={label}
            >
              <span className="dense-section-label" aria-hidden="true">
                {label}
              </span>
              <div className="dense-tool-row">
                {tools.map((tool) => {
                  // V and 1 follow the editor's preferred selection tool.
                  let shortcut = tool.shortcut;
                  if (tool.type === "selection" || tool.type === "lasso") {
                    shortcut =
                      tool.type === app.state.preferredSelectionTool.type
                        ? selectionShortcut ?? null
                        : null;
                  }
                  const description = shortcut
                    ? `${tool.label} (${shortcut})`
                    : tool.label;

                  return (
                    <button
                      key={tool.type}
                      type="button"
                      className="dense-tool"
                      data-tool={tool.type}
                      aria-pressed={tool.active}
                      aria-label={description}
                      disabled={tool.disabled}
                      title={description}
                      onClick={tool.select}
                    >
                      <span className="dense-icon" aria-hidden="true">
                        {tool.icon}
                      </span>
                      <span className="dense-tool-label">
                        {shortLabels[tool.type] ?? tool.label}
                      </span>
                      {shortcut ? (
                        <kbd>{shortcut.replace(` ${t("helpDialog.or")} `, " / ")}</kbd>
                      ) : (
                        <span className="dense-no-key" aria-hidden="true">
                          —
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="dense-actions" role="group" aria-label="Power actions">
          <span className="dense-section-label" aria-hidden="true">
            Quick actions
          </span>
          <ActionButton
            label="Undo"
            icon={UndoIcon}
            shortcut={getShortcutKey("CtrlOrCmd+Z")}
            onClick={undo}
          />
          <ActionButton
            label="Redo"
            icon={RedoIcon}
            shortcut={getShortcutKey("CtrlOrCmd+Shift+Z")}
            onClick={redo}
          />
          <ActionButton
            label="Tool lock"
            icon={locked ? LockedIcon : UnlockedIcon}
            shortcut={getShortcutFromShortcutName("toolLock")}
            onClick={toggleLock}
            pressed={locked}
          />
          <ActionButton
            label="Grid"
            icon={gridIcon}
            shortcut={getShortcutFromShortcutName("gridMode")}
            onClick={toggleGrid}
            pressed={appState.gridModeEnabled}
            disabled={app.props.gridModeEnabled !== undefined}
          />
          <ActionButton label="Library" icon={LibraryIcon} onClick={openLibrary} />
          <ActionButton
            label="Command palette"
            icon={boltIcon}
            shortcut={getShortcutFromShortcutName("commandPalette")}
            onClick={openCommandPalette}
          />
        </div>
      </div>
      {renderHint()}
    </div>
  );
}

const styles = `
  .toolbar-dense {
    inline-size: min(990px, 72vw);
    color: var(--color-on-surface);
  }
  .toolbar-dense .dense-dock {
    background: var(--island-bg-color);
    border: 1px solid var(--color-border-outline-variant);
    border-radius: 12px;
    box-shadow: 0 3px 12px rgb(25 24 55 / 9%);
  }
  .toolbar-dense .dense-tools,
  .toolbar-dense .dense-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px;
  }
  .toolbar-dense .dense-group {
    flex: 1 1 auto;
    display: grid;
    gap: 3px;
    padding: 5px;
    border-radius: 7px;
    background: var(--color-surface-mid);
  }
  .toolbar-dense .dense-tool-row {
    display: flex;
    gap: 2px;
  }
  .toolbar-dense .dense-section-label {
    padding-inline: 5px;
    font: 700 10px/16px system-ui, sans-serif;
    letter-spacing: 0.075em;
    text-transform: uppercase;
  }
  .toolbar-dense .dense-tool,
  .toolbar-dense .dense-action {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 5px;
    color: inherit;
    background: transparent;
    font: 600 11px/1.2 system-ui, sans-serif;
    white-space: nowrap;
    cursor: pointer;
  }
  .toolbar-dense .dense-tool {
    flex: 1 0 auto;
    flex-direction: column;
    gap: 3px;
    min-inline-size: 41px;
    padding: 4px 2px 3px;
  }
  .toolbar-dense .dense-icon {
    display: inline-flex;
    flex: none;
  }
  .toolbar-dense .dense-tool svg {
    width: 18px;
    height: 18px;
  }
  .toolbar-dense .dense-tool-label {
    max-inline-size: 56px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .toolbar-dense kbd,
  .toolbar-dense .dense-no-key {
    border: 1px solid var(--color-border-outline-variant);
    border-radius: 3px;
    padding: 0 3px;
    background: var(--island-bg-color);
    font: 500 10px/13px ui-monospace, Consolas, monospace;
  }
  .toolbar-dense .dense-no-key {
    border-color: transparent;
    background: transparent;
  }
  .toolbar-dense .dense-actions {
    align-items: center;
    padding: 4px 9px;
    border-top: 1px solid var(--color-border-outline-variant);
  }
  .toolbar-dense .dense-action {
    gap: 5px;
    min-block-size: 29px;
    padding: 0 7px;
  }
  .toolbar-dense .dense-action svg {
    width: 15px;
    height: 15px;
  }
  .toolbar-dense button:not(:disabled):hover {
    background: var(--color-surface-high);
  }
  .toolbar-dense button[aria-pressed="true"],
  .toolbar-dense button[aria-pressed="true"]:not(:disabled):hover {
    border-color: var(--color-primary);
    background: var(--color-surface-primary-container);
  }
  .toolbar-dense button:focus-visible {
    outline: 2px solid var(--color-primary-darkest);
    outline-offset: 1px;
  }
  .toolbar-dense button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
