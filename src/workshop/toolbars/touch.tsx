import { useEffect, useId, useRef, useState } from "react";

import {
  LockedIcon,
  UnlockedIcon,
} from "@excalidraw/excalidraw/components/icons";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Big and touch friendly",
  idea: "A thumb-height dock with big, labeled targets and an extra tray that opens upward.",
};

const dockTools = [
  "hand",
  "selection",
  "rectangle",
  "arrow",
  "freedraw",
  "text",
  "eraser",
] as const satisfies readonly ToolbarTool["type"][];

const isDockTool = (tool: ToolbarTool) =>
  dockTools.some((type) => type === tool.type);

const styles = `
  .toolbar-touch {
    --touch-surface: #fff;
    --touch-tile: #f0f4f6;
    --touch-ink: #1d3440;
    --touch-edge: #d3dee3;
    --touch-accent: #065b54;
    --touch-selected: #d3f4ea;
    position: absolute;
    /* Leave room for the bottom-centered Lab pill and the native footer. */
    bottom: calc(116px - var(--editor-container-padding));
    inset-inline: 0;
    margin-inline: auto;
    width: min(700px, calc(100% - 112px));
    container-type: inline-size;
    pointer-events: none;
    text-align: center;
    font-family: var(--ui-font);
    color: var(--touch-ink);
    user-select: none;
  }
  .theme--dark .toolbar-touch {
    --touch-surface: #1d292f;
    --touch-tile: #2a3a43;
    --touch-ink: #edf5f8;
    --touch-edge: #465d69;
    --touch-accent: #a4f5dc;
    --touch-selected: #16483f;
  }
  .App-toolbar-container.zen-mode .toolbar-touch {
    display: none;
  }
  /* Anchor to the editor's inset UI layer, not the top toolbar's wrapper. */
  .shapes-section:has(.toolbar-touch) > div {
    display: contents;
  }
  /* The native welcome arrow points at the default top toolbar. */
  .shapes-section:has(.toolbar-touch) .welcome-screen-decor-hint--toolbar {
    display: none;
  }
  .toolbar-touch .touch-dock,
  .toolbar-touch .touch-tray {
    box-sizing: border-box;
    display: grid;
    gap: 8px;
    padding: 8px;
    color: inherit;
    background: var(--touch-surface);
    border: 1px solid var(--touch-edge);
    box-shadow: 0 6px 24px #172f4420, 0 2px 6px #172f4414;
    border-radius: 20px;
    pointer-events: var(--ui-pointerEvents);
  }
  .toolbar-touch .touch-dock {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
  .toolbar-touch .touch-tray {
    position: absolute;
    inset-inline: 0;
    bottom: calc(100% + 10px);
    grid-template-columns: repeat(6, minmax(0, 1fr));
    max-height: min(278px, max(86px, calc(100dvh - 298px)));
    overflow: auto;
    overscroll-behavior: contain;
  }
  .toolbar-touch .touch-tray[hidden] {
    display: none;
  }
  @container (max-width: 610px) {
    .toolbar-touch .touch-dock,
    .toolbar-touch .touch-tray {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  .toolbar-touch .touch-tray-title {
    grid-column: 1 / -1;
    padding: 3px 4px 0;
    text-align: start;
    font-size: 13px;
    font-weight: 700;
  }
  .toolbar-touch .touch-key {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 0;
    min-height: 64px;
    padding: 6px 3px;
    border: 1px solid transparent;
    border-radius: 13px;
    color: inherit;
    background: var(--touch-tile);
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    line-height: 1.15;
    text-align: center;
    overflow-wrap: anywhere;
    cursor: pointer;
    touch-action: manipulation;
  }
  .toolbar-touch .touch-key:not(:disabled):hover,
  .toolbar-touch .touch-more {
    border-color: var(--touch-edge);
  }
  .toolbar-touch .touch-key[aria-pressed="true"],
  .toolbar-touch .touch-more[aria-expanded="true"],
  .toolbar-touch .touch-more[data-active="true"] {
    border-color: var(--touch-accent);
    background: var(--touch-selected);
    color: var(--touch-accent);
  }
  .toolbar-touch .touch-key:focus-visible {
    outline: 2px solid var(--touch-accent);
    outline-offset: 2px;
  }
  .toolbar-touch .touch-key:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }
  .toolbar-touch .touch-icon,
  .toolbar-touch .touch-icon svg {
    display: block;
    width: 23px;
    height: 23px;
  }
  .toolbar-touch .touch-hint > .HintViewer {
    top: auto;
    bottom: calc(100% + 6px);
    margin: 0;
  }
`;

const ToolButton = ({
  tool,
  onSelect,
}: {
  tool: ToolbarTool;
  onSelect: () => void;
}) => (
  <button
    type="button"
    className="touch-key"
    aria-pressed={tool.active}
    disabled={tool.disabled}
    title={tool.shortcut ? `${tool.label} · ${tool.shortcut}` : tool.label}
    onClick={onSelect}
  >
    <span className="touch-icon" aria-hidden="true">
      {tool.icon}
    </span>
    <span>
      {tool.type === "hand"
        ? "Pan"
        : tool.type === "selection"
          ? "Select"
          : tool.label}
    </span>
  </button>
);

export default function TouchToolbar({
  app,
  tools,
  locked,
  toggleLock,
  renderHint,
}: ToolbarProps) {
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const trayId = useId();
  const secondary = tools.filter((tool) => !isDockTool(tool));
  const activeSecondary = secondary.find((tool) => tool.active);

  useEffect(() => {
    if (!expanded) {
      return;
    }
    const doc = app.ownerDocument;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !event.composedPath().includes(rootRef.current)) {
        setExpanded(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setExpanded(false);
        if (rootRef.current?.contains(doc.activeElement)) {
          moreRef.current?.focus();
        }
      }
    };
    doc.addEventListener("pointerdown", onPointerDown, true);
    doc.addEventListener("keydown", onKeyDown, true);
    return () => {
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("keydown", onKeyDown, true);
    };
  }, [app, expanded]);

  return (
    <div className="toolbar-touch" ref={rootRef}>
      <style>{styles}</style>
      {!expanded && <div className="touch-hint">{renderHint()}</div>}
      <div className="touch-dock" role="group" aria-label="Drawing tools">
        {dockTools.map((type) => {
          const tool = tools.find((item) => item.type === type);
          return (
            tool && (
              <ToolButton
                key={type}
                tool={tool}
                onSelect={() => {
                  tool.select();
                  setExpanded(false);
                }}
              />
            )
          );
        })}
        <button
          type="button"
          className="touch-key touch-more"
          aria-expanded={expanded}
          aria-controls={trayId}
          aria-label={
            activeSecondary ? `More tools: ${activeSecondary.label}` : undefined
          }
          title={activeSecondary ? `Selected: ${activeSecondary.label}` : undefined}
          data-active={!!activeSecondary}
          onClick={() => setExpanded((open) => !open)}
          ref={moreRef}
        >
          <span className="touch-icon" aria-hidden="true">
            {!expanded && activeSecondary ? (
              activeSecondary.icon
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={expanded ? "m6 9 6 6 6-6" : "m6 15 6-6 6 6"} />
              </svg>
            )}
          </span>
          <span>More tools</span>
        </button>
      </div>
      <div
        className="touch-tray"
        id={trayId}
        role="group"
        aria-labelledby={`${trayId}-title`}
        hidden={!expanded}
      >
        <div className="touch-tray-title" id={`${trayId}-title`}>
          More drawing tools
        </div>
        {secondary.map((tool) => (
          <ToolButton
            key={tool.type}
            tool={tool}
            onSelect={() => {
              setExpanded(false);
              moreRef.current?.focus();
              tool.select();
            }}
          />
        ))}
        <button
          type="button"
          className="touch-key"
          aria-pressed={locked}
          title="Keep the selected tool after drawing · Q"
          onClick={toggleLock}
        >
          <span className="touch-icon" aria-hidden="true">
            {locked ? LockedIcon : UnlockedIcon}
          </span>
          <span>Keep tool</span>
        </button>
      </div>
    </div>
  );
}
