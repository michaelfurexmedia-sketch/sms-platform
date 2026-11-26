"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { brand } from "./config";
import { freshState, type State } from "./model";
import { services } from "./services";
type Store = {
  state: State;
  ready: boolean;
  mutate: <T>(fn: (s: State) => T) => T;
  error: string;
  clearError: () => void;
};
const Context = createContext<Store | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(freshState);
  const current = useRef(state);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(brand.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.version !== 1 || !Array.isArray(parsed.workspaces))
          throw Error("Unsupported saved data");
        current.current = parsed;
        setState(parsed);
      }
    } catch {
      setError(
        "Saved demo data could not be loaded. This session starts empty.",
      );
    }
    setReady(true);
    const sync = (e: StorageEvent) => {
      if (e.key === brand.storageKey && e.newValue) {
        try {
          const s = JSON.parse(e.newValue);
          if (s.version === 1) {
            current.current = s;
            setState(s);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const mutate = useCallback(<T,>(fn: (s: State) => T): T => {
    const next = structuredClone(current.current);
    const result = fn(next);
    try {
      localStorage.setItem(brand.storageKey, JSON.stringify(next));
    } catch {
      throw Error(
        "Browser storage is unavailable or full. Enable storage before continuing.",
      );
    }
    current.current = next;
    setState(next);
    return result;
  }, []);
  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      if (
        current.current.workspaces.some((w) =>
          w.campaigns.some(
            (c) =>
              c.state === "Scheduled" &&
              new Date(c.scheduledAt).getTime() <= Date.now(),
          ),
        )
      ) {
        try {
          mutate((s) => services.messaging.tick(s));
        } catch (e) {
          setError(String(e));
        }
      }
    };
    tick();
    const interval = setInterval(tick, 15000);
    return () => clearInterval(interval);
  }, [ready, mutate]);
  return (
    <Context.Provider
      value={{ state, ready, mutate, error, clearError: () => setError("") }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const s = useContext(Context);
  if (!s) throw Error("Store provider missing");
  return s;
}
