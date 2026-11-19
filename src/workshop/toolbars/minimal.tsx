import { useEffect, useId, useRef, useState } from "react";

import { IconButton } from "@excalidraw/excalidraw/components/IconButton";
import { TOOLS } from "@excalidraw/excalidraw/components/Tools";
import {
  hideTooltip,
  showTooltip,
} from "@excalidraw/excalidraw/components/Tooltip";
import {
  DotsIcon,
  LockedIcon,
  PenModeIcon,
  UnlockedIcon,
} from "@excalidraw/excalidraw/components/icons";
import { t } from "@excalidraw/excalidraw/i18n";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Minimal and calm",
  idea: "Keep six sketching essentials in sight and tuck everything else behind More tools.",
};

const essentials = [
  "selection",
  "rectangle",
  "arrow",
  "freedraw",
  "text",
  "stickynote",
] as const;

const tooltip = (name: string, shortcut?: string | null) =>
  `${name} · ${shortcut || "No keyboard shortcut"}`;

const styles = `
  .toolbar-minimal {
    position: relative;
    color: var(--color-on-surface);
  }
  .toolbar-minimal .minimal-strip,
  .toolbar-minimal .minimal-panel {
    background: var(--island-bg-color);
    border: 1px solid var(--default-border-color);
    border-radius: 12px;
    box-shadow: 0 2px 6px rgb(0 0 0 / 5%);
  }
  .toolbar-minimal .minimal-strip {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 5px;
  }
  .toolbar-minimal .minimal-strip .ToolIcon__icon {
    width: auto;
    min-width: 36px;
    height: 36px;
    gap: 6px;
    padding: 0 9px;
    border-radius: 7px;
    white-space: nowrap;
    font: 500 0.8125rem var(--ui-font);
  }
  .toolbar-minimal .ToolIcon__icon svg {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
  .toolbar-minimal .minimal-divider {
    width: 1px;
    height: 20px;
    margin-inline: 4px;
    background: var(--default-border-color);
  }
  .toolbar-minimal .minimal-more[aria-expanded="true"],
  .toolbar-minimal .minimal-more[data-active="true"] {
    --icon-fill-color: var(--color-on-primary-container);
    background: var(--color-surface-primary-container);
  }
  .toolbar-minimal .minimal-panel {
    position: absolute;
    z-index: 3;
    inset-inline-end: 0;
    top: calc(100% + 8px);
    width: max-content;
    max-width: min(360px, calc(100vw - 32px));
    max-height: calc(100dvh - 100px);
    box-sizing: border-box;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 12px;
    padding: 10px;
    box-shadow: var(--shadow-island);
  }
  .toolbar-minimal .minimal-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .toolbar-minimal .minimal-options {
    grid-column: 1 / -1;
    padding-top: 6px;
    border-top: 1px solid var(--default-border-color);
  }
  .toolbar-minimal .minimal-group-label {
    padding: 5px 8px;
    font: 600 0.6875rem var(--ui-font);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-primary-color);
  }
  .toolbar-minimal .minimal-panel .ToolIcon__icon {
    width: 100%;
    height: auto;
    min-height: 34px;
    justify-content: flex-start;
    gap: 8px;
    padding: 4px 8px;
    text-align: start;
    font: 500 0.8125rem var(--ui-font);
  }
  .toolbar-minimal .minimal-panel .ToolIcon__toggle-label {
    flex: 1 1 auto;
  }
  .toolbar-minimal .minimal-shortcut {
    order: 1;
    margin-inline-start: auto;
    padding-inline-start: 4px;
    white-space: nowrap;
    font: 0.6875rem var(--ui-font);
  }
  @media (max-width: 860px) {
    .toolbar-minimal .minimal-essential:not(.minimal-sticky) .ToolIcon__toggle-label {
      display: none;
    }
  }
`;

export default function MinimalToolbar({
  tools,
  app,
  appState,
  locked,
  toggleLock,
  renderHint,
}: ToolbarProps) {
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const preferred = appState.preferredSelectionTool.type;
  const primary = essentials.map((type) =>
    tools.find((tool) => tool.type === (type === "selection" ? preferred : type)),
  );
  const extra = tools.filter(
    (tool) =>
      !primary.includes(tool) &&
      !(tool.type === "image" && app.props.UIOptions.tools?.image === false),
  );
  const moreLabel = t("toolBar.extraTools");
  const lockLabel = t("toolBar.lock");
  const penLabel = t("toolBar.penMode");
  const isHostControlled = app.props.activeTool != null;

  useEffect(() => {
    if (!expanded) {
      return;
    }
    const dismissOutside = (event: PointerEvent) => {
      if (root.current && !event.composedPath().includes(root.current)) {
        setExpanded(false);
      }
    };
    const { ownerDocument } = app;
    ownerDocument.addEventListener("pointerdown", dismissOutside, true);
    return () =>
      ownerDocument.removeEventListener("pointerdown", dismissOutside, true);
  }, [app, expanded]);

  const toolButton = (tool: ToolbarTool, inPanel = false) => {
    const shortcutTool =
      tool.type === preferred
        ? tools.find(({ type }) => type === "selection")
        : tool.type === "selection"
        ? undefined
        : tool;
    const shortcut = shortcutTool?.shortcut;
    const keys = shortcutTool && TOOLS[shortcutTool.type];
    const letters = !keys?.letterKey
      ? []
      : typeof keys.letterKey === "string"
      ? [keys.letterKey]
      : keys.letterKey;
    const ariaKeys = [
      ...letters.map(
        (key) => `${keys?.shiftKey ? "Shift+" : ""}${key.toUpperCase()}`,
      ),
      keys?.numericKey,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <IconButton
        key={tool.type}
        type="toggle"
        className={
          inPanel
            ? undefined
            : tool.type === "stickynote"
            ? "minimal-essential minimal-sticky"
            : "minimal-essential"
        }
        checked={tool.active}
        disabled={tool.disabled}
        icon={
          <>
            {tool.icon}
            {inPanel && shortcut && (
              <span className="minimal-shortcut" aria-hidden="true">
                {shortcut}
              </span>
            )}
          </>
        }
        aria-label={tool.label}
        aria-keyshortcuts={ariaKeys || undefined}
        title={tooltip(tool.label, shortcut)}
        data-testid={`toolbar-${tool.type}`}
        showAriaLabel
        onPointerDown={(event) =>
          app.toolDrag.handleButtonPointerDown(tool.type, event.nativeEvent)
        }
        onSelect={({ pointerType }) => {
          if (pointerType === "pen" && !app.state.penDetected) {
            app.togglePenMode(true);
          }
          if (
            tool.type === "selection" &&
            tool.active &&
            pointerType !== null &&
            !inPanel &&
            !isHostControlled
          ) {
            app.setActiveTool({ type: "lasso" });
          } else {
            tool.select();
          }
          if (inPanel) {
            if (
              !isHostControlled &&
              (tool.type === "selection" || tool.type === "lasso")
            ) {
              app.setAppState({
                preferredSelectionTool: { type: tool.type, initialized: true },
              });
            }
            setExpanded(false);
            if (tool.type !== "image") {
              app.focusContainer();
            }
          }
        }}
      />
    );
  };

  return (
    <div
      ref={root}
      className={`App-toolbar toolbar-minimal${appState.zenModeEnabled ? " zen-mode" : ""}`}
      data-viewport-ui="top"
      onFocus={(event) => {
        const { target } = event;
        if (
          target instanceof app.ownerWindow.HTMLButtonElement &&
          target.title &&
          target.matches(":focus-visible")
        ) {
          showTooltip(target, target.title);
        }
      }}
      onBlur={(event) => {
        hideTooltip();
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setExpanded(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) {
          event.preventDefault();
          event.stopPropagation();
          setExpanded(false);
          more.current?.focus();
          hideTooltip();
        }
      }}
    >
      <style>{styles}</style>
      <div className="minimal-strip" role="group" aria-label="Sketch tools">
        {primary.map((tool) => tool && toolButton(tool))}
        <span className="minimal-divider" aria-hidden="true" />
        <button
          ref={more}
          type="button"
          className="minimal-more ToolIcon ToolIcon_type_toggle"
          data-active={extra.some((tool) => tool.active) || locked}
          aria-expanded={expanded}
          aria-controls={expanded ? panelId : undefined}
          aria-label={moreLabel}
          title={tooltip(moreLabel)}
          onClick={() => {
            hideTooltip();
            if (!expanded) {
              app.setAppState({ openMenu: null, openPopup: null });
            }
            setExpanded(!expanded);
          }}
        >
          <span className="ToolIcon__icon">
            {DotsIcon}
            <span>More</span>
          </span>
        </button>
      </div>
      {renderHint()}
      {expanded && (
        <div
          className="minimal-panel"
          id={panelId}
          aria-label={moreLabel}
          role="group"
        >
          {(["main", "more"] as const).map((group) => {
            const label = group === "main" ? "Sketch & edit" : "Specialty tools";
            return (
              <div
                className="minimal-group"
                key={group}
                role="group"
                aria-label={label}
              >
                <div className="minimal-group-label" aria-hidden="true">
                  {label}
                </div>
                {extra
                  .filter((tool) => tool.group === group)
                  .map((tool) => toolButton(tool, true))}
              </div>
            );
          })}
          {(!isHostControlled || appState.penDetected) && (
            <div
              className="minimal-group minimal-options"
              role="group"
              aria-label="Tool options"
            >
              <div className="minimal-group-label" aria-hidden="true">
                Tool options
              </div>
              {!isHostControlled && (
                <IconButton
                  type="toggle"
                  checked={locked}
                  icon={
                    <>
                      {locked ? LockedIcon : UnlockedIcon}
                      <span className="minimal-shortcut" aria-hidden="true">
                        Q
                      </span>
                    </>
                  }
                  aria-label={lockLabel}
                  aria-keyshortcuts="Q"
                  title={tooltip(lockLabel, "Q")}
                  data-testid="toolbar-lock"
                  onSelect={() => toggleLock()}
                  showAriaLabel
                />
              )}
              {appState.penDetected && (
                <IconButton
                  type="toggle"
                  checked={appState.penMode}
                  icon={PenModeIcon}
                  aria-label={penLabel}
                  title={tooltip(penLabel)}
                  onSelect={() => app.togglePenMode(null)}
                  showAriaLabel
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
