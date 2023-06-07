import { setHandler } from "../useMatchMedia";
import { MatchMediaHydrationContext } from "../MatchMediaHydrationProvider";

export type MediaQueryEnvironmentConfig = {
  all?: true;
  anyHover?: "none" | "hover";
  anyPointer?: "none" | "fine" | "coarse";
  aspectRatio?: number;
  color?: number;
  colorGamut?: "srgb" | "p3" | "rec2020";
  colorIndex?: number;
  displayMode?:
    | "fullscreen"
    | "standalone"
    | "minimal-ui"
    | "browser"
    | "window-controls-overlay";
  dynamicRange?: "standard" | "high";
  forcedColors?: "none" | "active";
  grid?: 0 | 1;
  /** in px */
  height?: number;
  hover?: "none" | "hover";
  invertedColors?: "none" | "inverted";
  monochrome?: number;
  orientation?: "portrait" | "landscape";
  overflowBlock?: "none" | "scroll" | "optional-paged" | "paged";
  overflowInline?: "none" | "scroll";
  pointer?: "none" | "fine" | "coarse";
  prefersColorScheme?: "no-preference" | "light" | "dark";
  prefersContrast?: "no-preference" | "more" | "less";
  prefersReducedMotion?: "no-preference" | "reduce";
  print?: true;
  /** in dpi */
  resolution?: number;
  screen?: true;
  scripting?: "none" | "initial-only" | "enabled";
  update?: "none" | "slow" | "fast";
  videoDynamicRange?: "standard" | "high";
  /** in px */
  width?: number;
  prefersReducedTransparency?: "no-preference" | "reduce";
  lightLevel?: "dim" | "normal" | "washed";
};

type Operator = ">" | "<" | "=" | ">=" | "<=";

const comparer = (a: number, operator: Operator, b: number) => {
  switch (operator) {
    case ">":
      return a > b;
    case "<":
      return a < b;
    case "=":
      return a === b;
    case ">=":
      return a >= b;
    case "<=":
      return a <= b;
  }
};

const toCamelCase = (str: string) =>
  str.replace(/-(\w)|^(min|max)-/g, (_, letter) =>
    letter ? letter.toUpperCase() : ""
  );

const warnAboutMissedKey = (key: string, mediaQuey: string) => {
  console.warn(
    `"${key}" is not found in the provided config, but it exists in "${mediaQuey}". Therefore, it has been set to false as a fallback.`
  );
};

/**
 * Configures the Node environment for server-side rendering (SSR) or testing scenarios.
 *
 * This function is used to set up the environment for the `useMatchMedia` hook
 * when running React components on the server or in testing environments. It allows
 * you to provide a custom configuration object to simulate different media query results.
 *
 * The configuration object should contain properties that match the media query conditions
 * you want to simulate. For example, if you configure it with `{ width: 768 }`, it will
 * simulate the viewport width as if it were 768 pixels wide, affecting the results returned
 * by `useMatchMedia` when evaluating media queries related to width.
 *
 * @param config - The configuration object for the environment.
 * @returns The context object to be used with the `MatchMediaHydrationProvider`.
 *
 * @example
 * ```jsx
 * import {
 *   useMatchMedia,
 *   configureNodeEnv,
 *   MatchMediaHydrationProvider,
 * } from "react-hook-media";
 *
 * const MyComponent = () => {
 *   const isDesktop = useMatchMedia("(min-width: 900px)");
 *
 *   return <div>{isDesktop ? "This is desktop" : "This is mobile"}</div>;
 * };
 *
 * const IndexPage = ({ mediaHydrationCtx }) => (
 *   <MatchMediaHydrationProvider value={mediaHydrationCtx}>
 *     <MyComponent />
 *   </MatchMediaHydrationProvider>
 * );
 *
 * export const getServerSideProps = async () => {
 *   return {
 *     props: {
 *       mediaHydrationCtx: configureNodeEnv({ width: 1000 }),
 *     },
 *   };
 * };
 * ```
 */
const configureNodeEnv = (config: MediaQueryEnvironmentConfig) => {
  config = { ...config };

  config.all = true;

  if (!config.print && !config.screen) {
    config.print = config.screen = true;
  }

  const createUnitParser = (unit: string) => (value: string | undefined) => {
    if (!value || !value.endsWith(unit)) {
      throw new Error("unsupported format");
    }

    return parseInt(value);
  };

  const parsers = {
    aspectRatio(value) {
      if (!value) {
        throw new Error("unsupported format");
      }

      const item = value.split("/");

      const res = +item[0] / +item[1];

      if (isNaN(res)) {
        throw new Error("NaN");
      }

      return res;
    },
    color: Number,
    colorIndex: Number,
    grid: Number,
    height: createUnitParser("px"),
    monochrome: Number,
    resolution: createUnitParser("dpi"),
    width: createUnitParser("px"),
  } satisfies Partial<
    Record<
      keyof MediaQueryEnvironmentConfig,
      (value: string | undefined) => any
    >
  >;

  const store: MatchMediaHydrationContext = {};

  setHandler((mediaQuery) => {
    if (mediaQuery in store) {
      return store[mediaQuery];
    }

    const split = mediaQuery.split(",");

    for (let i = 0; i < split.length; i++) {
      const arr = split[i]
        .trim()
        .replaceAll("only ", "")
        .replace(/\((.*?)\)/g, "$1")
        .replace(/(\w+)\s*([<>]=?|=)\s*(?=[<>\w-])/g, "$1$2")
        .replaceAll(": ", ":")
        .split(/([\s()])/)
        .reduce<string[]>((acc, t) => {
          const item = t.trim();
          if (item) {
            acc.push(item);
          }
          return acc;
        }, []);

      const queue: string[] = [""];

      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];

        const currIndex = queue.length - 1;

        if (item == "(") {
          queue.push("");
        } else if (item == ")") {
          queue[currIndex - 1] += eval(queue.pop()!);
        } else if (item == "or") {
          queue[currIndex] += "||";
        } else if (item == "and") {
          queue[currIndex] += "&&";
        } else if (item == "not") {
          queue[currIndex] += "!";
        } else if (
          /^[^\s()]+[<>=]{1,2}[^\s()]+(?:[<>=]{1,2}[^\s()]+)?$/.test(item)
        ) {
          const split = item.match(/[^\s()<>=]+|[<>=]{1,2}/g)!;

          if (split.length == 3) {
            const operand1 = split[0];

            const operand2 = split[2];

            let parsedOperand1: number | undefined;

            let parsedOperand2: number | undefined;

            let kebabKey: keyof typeof parsers;

            if (/^[-+]?\d+(\.\d+)?(?:.*)?$/i.test(operand1)) {
              kebabKey = toCamelCase(operand2) as keyof typeof parsers;

              parsedOperand2 = config[kebabKey];

              parsedOperand1 = parsers[kebabKey](operand1);
            } else {
              kebabKey = toCamelCase(operand1) as keyof typeof parsers;

              parsedOperand1 = config[kebabKey];

              parsedOperand2 = parsers[kebabKey](operand2);
            }

            if (parsedOperand1 != null && parsedOperand2 != null) {
              queue[currIndex] += comparer(
                parsedOperand1,
                split[1] as Operator,
                parsedOperand2
              );
            } else {
              queue[currIndex] += false;

              warnAboutMissedKey(kebabKey, mediaQuery);
            }
          } else if (split.length == 5) {
            const key = toCamelCase(split[2]) as keyof typeof parsers;

            const parser = parsers[key];

            const value = config[key];

            if (value != undefined) {
              queue[currIndex] +=
                comparer(parser(split[0]), split[1] as Operator, value) &&
                comparer(value, split[3] as Operator, parser(split[4]));
            } else {
              queue[currIndex] += false;

              warnAboutMissedKey(key, mediaQuery);
            }
          } else {
            throw new Error(`"${item}" in "${mediaQuery}" is incorrect`);
          }
        } else {
          const [kebabKey, value] = item.split(":") as [
            string,
            string | undefined
          ];

          const camelKey = kebabKey.replace(/-(\w)|^(min|max)-/g, (_, letter) =>
            letter ? letter.toUpperCase() : ""
          ) as keyof MediaQueryEnvironmentConfig;

          if (camelKey in config) {
            const check: (a: any, b: any) => boolean = kebabKey.startsWith(
              "min-"
            )
              ? (a, b) => a > b
              : kebabKey.startsWith("max-")
              ? (a, b) => a < b
              : (a, b) => (typeof b == "boolean" ? !!a == b : a === b);

            queue[currIndex] += check(
              config[camelKey],
              camelKey in parsers
                ? parsers[camelKey as keyof typeof parsers](value)
                : value ?? true
            );
          } else {
            queue[currIndex] += false;

            warnAboutMissedKey(camelKey, mediaQuery);
          }
        }
      }

      if (queue.length != 1) {
        throw new Error(`"${mediaQuery}" is incorrect`);
      }

      if (queue[0] ? eval(queue[0]) : true) {
        store[mediaQuery] = true;

        return true;
      }
    }

    store[mediaQuery] = false;

    return false;
  });

  return store;
};

export default configureNodeEnv;
