import { useState, useLayoutEffect, useContext } from "react";
import { HydrationContext } from "../MatchMediaHydrationProvider";
import noop from "lodash.noop";

/** @internal */
type HandleMediaQuery = (key: string) => boolean;

/** @internal */
type StoreItem = () => boolean;

/** @internal */
type SetHandler = {
  (handleMediaQuery: HandleMediaQuery): void;
};

type UseMatchMedia = {
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
   * @param {string} mediaQuery - The media query to be evaluated.
   * @returns {boolean} `true` if the media query matches, `false` otherwise.
   */
  (mediaQuery: string): boolean;
};

const tuple = ((): [UseMatchMedia, SetHandler] => {
  const regEx = /^@media( ?)/m;

  const store = new Map<string, StoreItem>();

  let useMatchMedia: HandleMediaQuery =
    typeof window != "undefined"
      ? (key) => {
          let useMatchMedia: StoreItem;

          if (store.has(key)) {
            useMatchMedia = store.get(key)!;
          } else {
            const set = new Set<(value: boolean) => void>();

            const mediaQueryList = matchMedia(key);

            let clientMatched = mediaQueryList.matches;

            mediaQueryList.onchange = (e) => {
              clientMatched = e.matches;

              const it = set.values();

              for (let i = set.size; i--; ) {
                it.next().value(clientMatched);
              }
            };

            useMatchMedia = () => {
              const hydrationCtx = useContext(HydrationContext);

              const isHydration = hydrationCtx && key in hydrationCtx;

              const [isMediaMatched, setMatched] = useState(
                isHydration ? hydrationCtx[key] : clientMatched
              );

              useLayoutEffect(() => {
                set.add(setMatched);

                return () => {
                  set.delete(setMatched);

                  if (!set.size) {
                    // The timeout is used here to handle React StrictMode and prevent unnecessary matchMedia calls when one component is replaced by another component with the same media query.
                    setTimeout(() => {
                      if (!set.size) {
                        mediaQueryList.onchange = null;

                        store.delete(key);
                      }
                    });
                  }
                };
              }, []);

              if (hydrationCtx) {
                if (isHydration) {
                  useLayoutEffect(() => {
                    delete hydrationCtx[key];

                    if (isMediaMatched != clientMatched) {
                      setMatched(clientMatched);
                    }
                  }, []);
                } else {
                  useLayoutEffect(noop, []);
                }
              }

              return isMediaMatched;
            };

            store.set(key, useMatchMedia);
          }

          return useMatchMedia();
        }
      : () => false;

  return [
    (mediaQuery) => useMatchMedia(mediaQuery.replace(regEx, "")),
    (_useMatchMedia) => {
      useMatchMedia = _useMatchMedia;
    },
  ];
})();

/** @internal */
export const replaceUseMatchMedia = tuple[1];

const useMatchMedia = tuple[0];

export default useMatchMedia;
