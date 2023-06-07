import { createContext } from "react";

export type MatchMediaHydrationContext = Record<string, boolean>;

/** @internal */
export const HydrationContext = createContext<MatchMediaHydrationContext>(
  null as any
);

/**
 * Context provider component for hydration of media query configuration.
 */
const MatchMediaHydrationProvider = HydrationContext.Provider;

export default MatchMediaHydrationProvider;
