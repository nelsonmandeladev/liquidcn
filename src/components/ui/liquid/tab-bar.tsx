"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { assignRef, useLiquidElement } from "@/lib/liquid/motion";
import { useLiquidRefraction } from "@/lib/liquid/refraction";
import { useTabBarMorph } from "@/lib/liquid/tab-bar";
import "./liquid.css";

type TabBarState = { searching: boolean; setSearching: (searching: boolean) => void };

const TabBarContext = createContext<TabBarState>({ searching: false, setSearching: () => {} });

export type TabBarProps = ComponentProps<"div"> & {
  /** Whether search is open. Leave undefined to let the tab bar manage it. */
  searching?: boolean;
  defaultSearching?: boolean;
  onSearchingChange?: (searching: boolean) => void;
};

/**
 * A floating tab bar with a search button beside it, as in iOS 26. Opening search collapses
 * the tabs into a circle and stretches the button into a field.
 */
export function TabBar({
  searching: controlled,
  defaultSearching = false,
  onSearchingChange,
  className,
  ref,
  ...props
}: TabBarProps) {
  const [node, mergedRef] = useLiquidElement(ref);
  const [uncontrolled, setUncontrolled] = useState(defaultSearching);
  const searching = controlled ?? uncontrolled;
  const setSearching = useCallback(
    (next: boolean) => {
      setUncontrolled(next);
      onSearchingChange?.(next);
    },
    [onSearchingChange],
  );
  const value = useMemo(() => ({ searching, setSearching }), [searching, setSearching]);
  useTabBarMorph(node, searching);
  return (
    <TabBarContext.Provider value={value}>
      <div
        ref={mergedRef}
        className={cn("liquid-tab-bar", className)}
        data-searching={searching ? "" : undefined}
        {...props}
      />
    </TabBarContext.Provider>
  );
}

export type TabBarItemsProps = ComponentProps<"div"> & {
  /** Shown in the circle the tabs collapse into, usually the selected tab's icon. */
  icon?: ReactNode;
  /** Accessible name of that circle, which closes search. */
  label?: string;
};

/** The glass around the tabs. Put a liquid `TabsList` (or any list of links) inside. */
export function TabBarItems({
  icon,
  label = "Show tabs",
  className,
  children,
  ref,
  ...props
}: TabBarItemsProps) {
  const { searching, setSearching } = useContext(TabBarContext);
  const [node, mergedRef] = useLiquidElement(ref);
  useLiquidRefraction(node);
  return (
    <div
      ref={mergedRef}
      className={cn("liquid-surface liquid-tab-bar-items", className)}
      {...props}
    >
      <div className="liquid-tab-bar-tabs" inert={searching} aria-hidden={searching || undefined}>
        {children}
      </div>
      {searching && (
        <button
          type="button"
          className="liquid-tab-bar-restore"
          aria-label={label}
          onClick={() => setSearching(false)}
        >
          {icon}
        </button>
      )}
    </div>
  );
}

/**
 * Focus the field when search opens, and the search button when it closes from inside. Returns
 * the field's ref, merged with the consumer's, and the search button's ref.
 */
function useSearchFocus(searching: boolean, root: HTMLElement | null, ref?: Ref<HTMLInputElement>) {
  const fieldRef = useRef<HTMLInputElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const previousRef = useRef(searching);
  useEffect(() => {
    if (previousRef.current === searching) return;
    previousRef.current = searching;
    const active = document.activeElement;
    if (searching) fieldRef.current?.focus();
    else if (!active || active === document.body || root?.contains(active))
      toggleRef.current?.focus();
  }, [searching, root]);
  const inputRef = useCallback(
    (element: HTMLInputElement | null) => {
      fieldRef.current = element;
      return assignRef(ref, element);
    },
    [ref],
  );
  return { inputRef, toggleRef };
}

export type TabBarSearchProps = ComponentProps<"input"> & {
  /** Accessible name of the button that closes search. */
  closeLabel?: string;
};

/**
 * The search button, which becomes the search field. Props, ref, and events go to the
 * `<input>`, except `className`, which styles the glass.
 */
export function TabBarSearch({
  className,
  placeholder = "Search",
  closeLabel = "Close search",
  "aria-label": label = "Search",
  onKeyDown,
  ref,
  ...props
}: TabBarSearchProps) {
  const { searching, setSearching } = useContext(TabBarContext);
  const [node, surfaceRef] = useLiquidElement<HTMLDivElement>();
  useLiquidRefraction(node);
  const { inputRef, toggleRef } = useSearchFocus(searching, node?.parentElement ?? null, ref);
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key !== "Escape" || event.defaultPrevented) return;
    event.preventDefault();
    setSearching(false);
  };
  return (
    <div
      ref={surfaceRef}
      className={cn("liquid-surface liquid-interactive liquid-tab-bar-search", className)}
    >
      {searching ? (
        <>
          <Search aria-hidden="true" className="liquid-tab-bar-glass" />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            placeholder={placeholder}
            aria-label={label}
            onKeyDown={keyDown}
            {...props}
          />
          <button
            type="button"
            className="liquid-tab-bar-close"
            aria-label={closeLabel}
            onClick={() => setSearching(false)}
          >
            <X aria-hidden="true" />
          </button>
        </>
      ) : (
        <button
          ref={toggleRef}
          type="button"
          className="liquid-tab-bar-toggle"
          aria-label={label}
          onClick={() => setSearching(true)}
        >
          <Search aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
