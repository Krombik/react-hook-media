import { useSyncExternalStore, useContext } from "react";
import { RehydrationContext } from "../utils/rehydration";

const store = new Map<string, () => boolean>();

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

  if (!store.has(mediaQuery)) {
    const set = new Set<() => void>();

    const mediaQueryList = matchMedia(mediaQuery);

    const subscribe = (onStoreChange: () => void) => {
      if (!mediaQueryList.onchange) {
        mediaQueryList.onchange = () => {
          const it = set.values();

          const next = it.next.bind(it);

          for (let i = set.size; i--; ) {
            next().value();
          }
        };
      }

      set.add(onStoreChange);

      return () => {
        set.delete(onStoreChange);

        if (!set.size) {
          mediaQueryList.onchange = null;
        }
      };
    };

    const getValue = () => mediaQueryList.matches;

    store.set(mediaQuery, () => {
      const ctx = useContext(RehydrationContext);

      return useSyncExternalStore(
        subscribe,
        getValue,
        ctx && (() => ctx[mediaQuery])
      );
    });
  }

  return store.get(mediaQuery)!();
};

export default useMatchMedia;
