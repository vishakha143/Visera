import { useCallback, useRef, useState } from "react";

// Tracks a value with undo/redo history. Rapid updates within `coalesceMs` of
// each other collapse into a single history entry, so typing a sentence is
// one undo step, not one per keystroke.
export function useUndoRedo(initialValue, coalesceMs = 800) {
  const [value, setValue] = useState(initialValue);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const lastPushAt = useRef(0);

  const set = useCallback(
    (next) => {
      const now = Date.now();
      const shouldPush = now - lastPushAt.current > coalesceMs;
      lastPushAt.current = now;

      if (shouldPush) {
        setPast((prev) => {
          const grown = [...prev, value];
          return grown.length > 100 ? grown.slice(1) : grown;
        });
      }
      setFuture([]);
      setValue(next);
    },
    [value, coalesceMs]
  );

  const reset = useCallback((next) => {
    setPast([]);
    setFuture([]);
    lastPushAt.current = 0;
    setValue(next);
  }, []);

  const undo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFuture((f) => [...f, value]);
      lastPushAt.current = 0;
      setValue(previous);
      return prev.slice(0, -1);
    });
  }, [value]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[prev.length - 1];
      setPast((p) => [...p, value]);
      lastPushAt.current = 0;
      setValue(next);
      return prev.slice(0, -1);
    });
  }, [value]);

  return {
    value,
    set,
    reset,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
