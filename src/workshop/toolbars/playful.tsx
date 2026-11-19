import { useEffect, useId, useRef, useState } from "react";

import { useStylesPanelMode } from "@excalidraw/excalidraw/components/App";
import { PenModeButton } from "@excalidraw/excalidraw/components/PenModeButton";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Playful and expressive",
  idea: "A sticker-sheet sketch kit with color-coded tools that lift off the page when picked.",
};

const families = [
  { id: "move", label: "Move & select" },
  { id: "shape", label: "Shapes & lines" },
  { id: "mark", label: "Marks & words" },
] as const;

const familyOf = (type: ToolbarTool["type"]) => {
  switch (type) {
    case "hand":
    case "selection":
      return "move";
    case "rectangle":
    case "diamond":
    case "ellipse":
    case "arrow":
    case "line":
      return "shape";
    default:
      return "mark";
  }
};

const tileLabel = (tool: ToolbarTool) => {
  switch (tool.type) {
    case "hand":
      return "Pan";
    case "selection":
      return "Select";
    default:
      return tool.label;
  }
};

const styles = `
.toolbar-playful {
  --kit-paper: #fffcf6;
  --kit-ink: #29233b;
  --kit-muted: #64596e;
  --kit-edge: #d7ccde;
  --kit-shadow: #ebe2ee;
  position: relative;
  box-sizing: border-box;
  width: 758px;
  max-width: calc(100vw - 152px);
  padding: 8px 10px 10px;
  border: 1px solid var(--kit-edge);
  border-radius: 17px;
  background: var(--kit-paper);
  box-shadow: 0 3px 0 var(--kit-shadow), 0 10px 22px #30214512;
  color: var(--kit-ink);
  font: 500 13px/1.2 system-ui, sans-serif;
}
.theme--dark .toolbar-playful {
  --kit-paper: #262131;
  --kit-ink: #fff5ff;
  --kit-muted: #e2d3ea;
  --kit-edge: #5e526e;
  --kit-shadow: #181420;
}
.toolbar-playful .kit-top,
.toolbar-playful .kit-brand,
.toolbar-playful .kit-status,
.toolbar-playful .kit-actions {
  display: flex;
  align-items: center;
}
.toolbar-playful .kit-top {
  justify-content: space-between;
  gap: 8px;
  margin: 0 2px 8px;
}
.toolbar-playful .kit-brand,
.toolbar-playful .kit-actions { gap: 8px; }
.toolbar-playful .kit-brand strong {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -.025em;
  white-space: nowrap;
}
.toolbar-playful .kit-stamp { flex: 0 0 29px; }
.toolbar-playful .kit-invite { color: var(--kit-muted); padding-inline-start: 4px; }
.toolbar-playful .kit-status {
  gap: 6px;
  color: var(--kit-muted);
  font-size: 12px;
}
.toolbar-playful .kit-status b { color: var(--kit-ink); }
.toolbar-playful .kit-key {
  box-sizing: border-box;
  min-width: 20px;
  padding: 2px 4px;
  border: 1px solid var(--kit-edge);
  border-radius: 4px;
  color: var(--kit-muted);
  text-align: center;
  font: 700 11px/1.15 system-ui, sans-serif;
}
.toolbar-playful .kit-repeat {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 30px;
  padding: 4px 8px;
  border: 1px solid var(--kit-edge);
  border-radius: 8px;
  background: transparent;
  color: var(--kit-ink);
  white-space: nowrap;
}
.toolbar-playful .kit-repeat[aria-pressed="true"] {
  background: #e5dcff;
  color: #38206a;
  border-color: #7960ad;
}
.toolbar-playful .kit-repeat:hover:not(:disabled) { border-color: currentColor; }
.toolbar-playful .kit-picks { display: flex; flex-wrap: wrap; gap: 6px; }
.toolbar-playful .kit-family, .toolbar-playful .kit-extra {
  --kit-wash: #f0eef9;
  --kit-sticker: #e6dfff;
  --kit-accent: #573b90;
  box-sizing: border-box;
  padding: 5px 4px 4px;
  border-radius: 10px;
  background: var(--kit-wash);
  color: #2e253d;
}
.toolbar-playful .kit-family { flex: 1 1 auto; }
.toolbar-playful [data-family="move"] {
  --kit-wash: #e9f4ec;
  --kit-sticker: #ccedda;
  --kit-accent: #21573d;
}
.toolbar-playful [data-family="mark"] {
  --kit-wash: #faede5;
  --kit-sticker: #ffdbbe;
  --kit-accent: #823d23;
}
.toolbar-playful .kit-extra {
  --kit-wash: #fff3d4;
  --kit-sticker: #ffe193;
  --kit-accent: #725217;
  position: relative;
}
.toolbar-playful .kit-family-title {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 4px 2px;
  color: var(--kit-accent);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .075em;
  text-transform: uppercase;
}
.toolbar-playful .kit-family-title::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 2px;
  transform: rotate(12deg);
  background: currentColor;
}
.toolbar-playful .kit-row { display: flex; justify-content: space-around; }
.toolbar-playful button {
  box-sizing: border-box;
  cursor: pointer;
  font: inherit;
}
.toolbar-playful button:focus-visible {
  outline: 2px solid #6b49aa;
  outline-offset: 2px;
}
.toolbar-playful button:disabled { opacity: .46; cursor: not-allowed; }
.toolbar-playful .kit-tile {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 3px;
  min-width: 49px;
  min-height: 52px;
  padding: 2px 4px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font-weight: 650;
  white-space: nowrap;
}
.toolbar-playful .kit-extra .kit-tile { width: 100%; }
.toolbar-playful .kit-icon {
  box-sizing: border-box;
  display: grid;
  place-items: center;
  width: 34px;
  height: 28px;
  border: 1px solid #ffffff99;
  border-radius: 8px 7px 9px 6px;
  background: var(--kit-sticker);
  color: var(--kit-accent);
  transition: transform 140ms ease-out, box-shadow 140ms ease-out;
}
.toolbar-playful .kit-icon > svg { width: 18px; height: 18px; }
.toolbar-playful .kit-tile:hover:not(:disabled) .kit-icon {
  transform: translateY(-2px) rotate(4deg);
}
.toolbar-playful .kit-tile[aria-pressed="true"],
.toolbar-playful .kit-tile[aria-expanded="true"],
.toolbar-playful .kit-tile[data-current="true"] { color: var(--kit-accent); font-weight: 800; }
.toolbar-playful .kit-tile[aria-pressed="true"] .kit-icon,
.toolbar-playful .kit-tile[aria-expanded="true"] .kit-icon,
.toolbar-playful .kit-tile[data-current="true"] .kit-icon {
  border-color: currentColor;
  box-shadow: 1px 2px 0 currentColor;
  transform: translateY(-1px) rotate(-5deg);
  animation: playful-peel 210ms ease-out;
}
@keyframes playful-peel {
  from { transform: translateY(1px) rotate(2deg) scale(.93); }
  60% { transform: translateY(-4px) rotate(-8deg) scale(1.05); }
}
.toolbar-playful .kit-tray {
  position: absolute;
  z-index: 1;
  inset-block-start: calc(100% + 10px);
  inset-inline-end: 0;
  min-width: 200px;
  padding: 5px;
  border: 1px solid var(--kit-edge);
  border-radius: 10px;
  background: var(--kit-paper);
  color: var(--kit-ink);
  box-shadow: 0 4px 0 var(--kit-shadow), 0 10px 22px #30214520;
}
.toolbar-playful .kit-tray-tool {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 36px;
  padding: 3px 6px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  text-align: start;
  white-space: nowrap;
}
.toolbar-playful .kit-tray-tool[aria-pressed="true"],
.toolbar-playful .kit-tray-tool:hover:not(:disabled) {
  color: #4a3613;
  background: #fff0c8;
}
.toolbar-playful .kit-tray-tool .kit-key { margin-inline-start: auto; }
.toolbar-playful .kit-tray-tool .kit-icon { width: 27px; height: 25px; }
.toolbar-playful.zen-mode .HintViewer { display: none; }
@media (max-width: 1060px) {
  .toolbar-playful { width: 485px; }
  .toolbar-playful .kit-invite, .toolbar-playful .kit-status-prefix { display: none; }
}
@media (max-width: 600px) {
  .toolbar-playful { max-width: calc(100vw - 106px); }
  .toolbar-playful .kit-status { display: none; }
  .toolbar-playful .kit-row { flex-wrap: wrap; }
}
@media (prefers-reduced-motion: reduce) {
  .toolbar-playful .kit-tile .kit-icon { transition: none; }
  .toolbar-playful .kit-tile:is([aria-pressed="true"], [aria-expanded="true"], [data-current="true"]) .kit-icon {
    animation: none;
  }
}
`;

const describeTool = (tool: ToolbarTool) =>
  tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label;

export default function PlayfulToolbar({
  app,
  appState,
  tools,
  locked,
  toggleLock,
  renderHint,
}: ToolbarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreId = useId();
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const mainTools = tools.filter((tool) => tool.group === "main");
  const moreTools = tools.filter((tool) => tool.group === "more");
  const active = tools.find((tool) => tool.active);
  const fullStylesPanel = useStylesPanelMode() === "full";
  const ownerDocument = app.ownerDocument;

  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    const dismissOutside = (event: PointerEvent) => {
      if (moreRef.current && !event.composedPath().includes(moreRef.current)) {
        setMoreOpen(false);
      }
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    ownerDocument.addEventListener("pointerdown", dismissOutside, true);
    ownerDocument.addEventListener("keydown", dismissOnEscape, true);
    return () => {
      ownerDocument.removeEventListener("pointerdown", dismissOutside, true);
      ownerDocument.removeEventListener("keydown", dismissOnEscape, true);
    };
  }, [moreOpen, ownerDocument]);

  return (
    <div
      className={`toolbar-playful${appState.zenModeEnabled ? " zen-mode" : ""}`}
      role="group"
      aria-label="Sketch kit tools"
      data-viewport-ui="top"
    >
      <style>{styles}</style>
      <div className="kit-top">
        <div className="kit-brand">
          <svg
            className="kit-stamp"
            aria-hidden="true"
            width="29"
            height="29"
            viewBox="0 0 30 30"
          >
            <path
              d="M6 4 25 6 26 20 19 26 4 24Z"
              fill="#ffc5b0"
              stroke="#54324e"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <path d="m19 26 1-7 6 1" fill="#ffefdb" stroke="#54324e" />
            <path
              d="M9 16c3-10 4 4 7-1l4-5m1-8 1 1m5 1-1 1"
              fill="none"
              stroke="#54324e"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <strong>Sketch kit</strong>
          <span className="kit-invite">Pick a tool and make a mark.</span>
        </div>
        <div className="kit-actions">
          {active && (
            <div className="kit-status" role="status" aria-atomic="true">
              <span className="kit-status-prefix">Picked:</span>
              <b>{tileLabel(active)}</b>
              {active.keyHint && (
                <kbd className="kit-key" aria-hidden="true">
                  {active.keyHint}
                </kbd>
              )}
            </div>
          )}
          {fullStylesPanel && (
            <PenModeButton
              checked={appState.penMode}
              onChange={() => app.togglePenMode(null)}
              title="Pen mode"
              penDetected={appState.penDetected}
            />
          )}
          {app.props.activeTool == null && (
            <button
              type="button"
              className="kit-repeat"
              title="Keep the picked tool after drawing"
              aria-pressed={locked}
              onClick={toggleLock}
            >
              <svg
                aria-hidden="true"
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7V5a1 1 0 0 1 1-1h8m-2-2 2 2-2 2m3 3v2a1 1 0 0 1-1 1H4m2-2-2 2 2 2" />
              </svg>
              Keep tool
            </button>
          )}
        </div>
      </div>

      <div className="kit-picks">
        {families.map(({ id, label }) => (
          <div
            className="kit-family"
            data-family={id}
            role="group"
            aria-label={label}
            key={id}
          >
            <div className="kit-family-title" aria-hidden="true">
              {label}
            </div>
            <div className="kit-row">
              {mainTools
                .filter((tool) => familyOf(tool.type) === id)
                .map((tool) => (
                  <button
                    type="button"
                    className="kit-tile"
                    key={tool.type}
                    data-testid={`toolbar-${tool.type}`}
                    title={describeTool(tool)}
                    aria-pressed={tool.active}
                    disabled={tool.disabled}
                    onClick={tool.select}
                  >
                    <span className="kit-icon" aria-hidden="true">
                      {tool.icon}
                    </span>
                    {tileLabel(tool)}
                  </button>
                ))}
            </div>
          </div>
        ))}
        <div
          className="kit-extra"
          ref={moreRef}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setMoreOpen(false);
            }
          }}
        >
          <div className="kit-family-title" aria-hidden="true">
            Extras
          </div>
          <button
            type="button"
            className="kit-tile"
            ref={moreButtonRef}
            title={
              active?.group === "more"
                ? `${active.label} picked · More tools`
                : "More tools"
            }
            aria-label="More tools"
            aria-expanded={moreOpen}
            aria-controls={moreId}
            data-current={active?.group === "more"}
            onClick={() => setMoreOpen((open) => !open)}
          >
            <span className="kit-icon" aria-hidden="true">
              {active?.group === "more" ? (
                active.icon
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="4" cy="10" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="16" cy="10" r="1.5" />
                </svg>
              )}
            </span>
            More
          </button>
          <div
            id={moreId}
            className="kit-tray"
            role="group"
            aria-label="Extra tools"
            hidden={!moreOpen}
          >
            {moreTools.map((tool) => (
              <button
                type="button"
                key={tool.type}
                className="kit-tray-tool"
                data-testid={`toolbar-${tool.type}`}
                title={describeTool(tool)}
                aria-pressed={tool.active}
                disabled={tool.disabled}
                onClick={() => {
                  setMoreOpen(false);
                  moreButtonRef.current?.focus();
                  tool.select();
                }}
              >
                <span className="kit-icon" aria-hidden="true">
                  {tool.icon}
                </span>
                {tool.label}
                {tool.keyHint && (
                  <kbd className="kit-key" aria-hidden="true">
                    {tool.keyHint}
                  </kbd>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      {renderHint()}
    </div>
  );
}
