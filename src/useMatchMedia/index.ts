import { useState, useLayoutEffect } from "react";
import { rehydration } from "../utils/rehydration";

/** @internal */
type StoreItem = {
  (): () => void;
  s(): boolean;
};

const store = new Map<string, StoreItem>();

/**
 * Custom hook that implements the behavior of the [matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) method as a React hook.
 *
 * > In a Node environment, where media queries are not supported, you must use the [configureNodeEnv](https://github.com/Krombik/react-hook-media#configurenodeenv) method to simulate different device conditions, like in this [example](https://github.com/Krombik/react-hook-media#example).
 *
 * @example
 * ```js
 * // Usage in a React component
 * const isMobile = useMatchMedia('(max-width: 768px)');
 * if (isMobile) {
 *   // Render mobile layout
 * } else {
 *   // Render desktop layout
 * }
 * ```
 *
 * @param mediaQuery - The media query to be evaluated.
 * @returns  `true` if the media query matches, `false` otherwise.
 */
const useMatchMedia = (mediaQuery: string) => {
  mediaQuery = mediaQuery.replace(/^@media( ?)/m, "");

  let effect: StoreItem;

  if (store.has(mediaQuery)) {
    effect = store.get(mediaQuery)!;
  } else {
    const set = new Set<(value: boolean) => void>();

    const mediaQueryList = matchMedia(mediaQuery);

    let clientMatched = mediaQueryList.matches;

    effect = (() => {
      if (!set.size) {
        mediaQueryList.onchange = (e) => {
          clientMatched = e.matches;

          const it = set.values();

          const next = it.next.bind(it);

          for (let i = set.size; i--; ) {
            next().value(clientMatched);
          }
        };
      }

      rehydration[1](clientMatched, mediaQuery, setMatched);

      set.add(setMatched);

      return () => {
        set.delete(setMatched);

        if (!set.size) {
          mediaQueryList.onchange = null;

          store.delete(mediaQuery);
        }
      };
    }) as StoreItem;

    effect.s = () => rehydration[0](clientMatched, mediaQuery);

    store.set(mediaQuery, effect);
  }

  const [isMediaMatched, setMatched] = useState(effect.s);

  useLayoutEffect(effect, []);

  return isMediaMatched;
};

export default useMatchMedia;
