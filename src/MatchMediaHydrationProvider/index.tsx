import { FC, PropsWithChildren, useEffect, useMemo } from "react";
import identity from "lodash.identity";
import noop from "lodash.noop";
import { rehydration } from "../utils/rehydration";

export type MatchMediaHydrationContext = [Record<string, boolean>];

/**
 * Context provider component for hydration of media query configuration.
 */
const MatchMediaHydrationProvider: FC<
  PropsWithChildren<{ value: MatchMediaHydrationContext }>
> = ({ value, children }) => {
  const deps = [value];

  useMemo(() => {
    const ctx = value[0];

    rehydration[0] = (clientState, mediaQuery) =>
      mediaQuery in ctx ? ctx[mediaQuery] : clientState;

    rehydration[1] = (clientValue, mediaQuery, setState) => {
      if (mediaQuery in ctx && clientValue != ctx[mediaQuery]) {
        setState(clientValue);
      }
    };
  }, deps);

  useEffect(() => {
    rehydration[0] = identity;

    rehydration[1] = noop;

    value.length = 0 as any;
  }, deps);

  return <>{children}</>;
};

export default MatchMediaHydrationProvider;
