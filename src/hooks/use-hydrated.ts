import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during SSR and the hydration pass, true afterwards. Persisted Zustand
 * stores read localStorage synchronously on the client, so anything rendered
 * from them must wait for this to avoid hydration mismatches.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
