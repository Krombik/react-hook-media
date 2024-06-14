import identity from "lodash.identity";
import noop from "lodash.noop";

/** @internal */
export const rehydration: [
  getState: (clientState: boolean, mediaQuery: string) => boolean,
  handleHydration: (
    clientState: boolean,
    mediaQuery: string,
    setState: (value: boolean) => void
  ) => void,
] = [identity, noop];
