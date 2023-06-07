import { useState, useLayoutEffect, useContext, useEffect } from "react";
import { HydrationContext } from "../MatchMediaHydrationProvider";
import noop from "lodash.noop";

/** @internal */
type HandleMediaQuery = (key: string) => boolean;

/** @internal */
type StoreItem = (forceRerender: (value: {}) => void) => boolean;

/** @internal */
type SetHandler = {
  (handleMediaQuery: HandleMediaQuery): void;
};

type UseMatchMedia = {
  /**
   * Custom hook that implements the behavior of the [matchMedia](#https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) method as a React hook.
   *
   * > In a Node environment, this hook will always return `false` by default since media queries
   * > are not supported. However, you can customize the behavior of `useMatchMedia` by using the
   * > `configureNodeEnv` method. See the documentation for `configureNodeEnv` for more information.
   *
   * @example
   * // Usage in a React component
   * const isMobile = useMatchMedia('(max-width: 768px)');
   * if (isMobile) {
   *   // Render mobile layout
   * } else {
   *   // Render desktop layout
   * }
   *
   * @param {string} mediaQuery - The media query to be evaluated.
   * @returns {boolean} `true` if the media query matches, `false` otherwise.
   */
  (mediaQuery: string): boolean;
};

const tuple = ((): [UseMatchMedia, SetHandler] => {
  const regEx = /^@media( ?)/m;

  const store = new Map<string, StoreItem>();

  let handleMediaQuery: HandleMediaQuery =
    typeof window != "undefined"
      ? (key) => {
          let storeItem: StoreItem;

          if (store.has(key)) {
            storeItem = store.get(key)!;
          } else {
            const set = new Set<(value: {}) => void>();

            const mediaQueryList = matchMedia(key);

            const onChange = (e: Pick<MediaQueryListEvent, "matches">) => {
              value = e.matches;

              const it = set.values();

              const next = {};

              for (let i = set.size; i--; ) {
                it.next().value(next);
              }
            };

            let value = mediaQueryList.matches;

            mediaQueryList.onchange = onChange;

            storeItem = (forceRerender) => {
              const hydrationCtx = useContext(HydrationContext);

              if (hydrationCtx) {
                if (key in hydrationCtx) {
                  const clientValue = value;

                  const serverValue = hydrationCtx[key];

                  value = serverValue;

                  delete hydrationCtx[key];

                  useEffect(() => {
                    if (clientValue != serverValue) {
                      onChange({ matches: clientValue });
                    }
                  }, []);
                } else {
                  useEffect(noop, []);
                }
              }

              useLayoutEffect(() => {
                set.add(forceRerender);

                return () => {
                  if (set.size > 1) {
                    set.delete(forceRerender);
                  } else {
                    mediaQueryList.onchange = null;

                    store.delete(key);
                  }
                };
              }, [key]);

              return value;
            };

            store.set(key, storeItem);
          }

          return storeItem(useState<{}>()[1]);
        }
      : () => false;

  return [
    (mediaQuery) => handleMediaQuery(mediaQuery.replace(regEx, "")),
    (_handleMediaQuery) => {
      handleMediaQuery = _handleMediaQuery;
    },
  ];
})();

/** @internal */
export const setHandler = tuple[1];

const useMatchMedia = tuple[0];

export default useMatchMedia;
