# react-hook-media

React Hook Media is a lightweight and tree-shakable library that provides tools for working with media queries in React applications. It allows you to easily incorporate responsive behavior and conditional rendering based on media query conditions.

The library also provides a server-side rendering (SSR) feature through the [configureNodeEnv](#configurenodeenv) method. It allows you to configure the Node environment to simulate different media query results during server-side rendering.

React Hook Media is simple to use and integrates seamlessly with React applications, providing a convenient way to handle media queries and create responsive UI components.

## Installation

using npm:

```bash
npm install --save react-hook-media
```

or yarn:

```bash
yarn add react-hook-media
```

or pnpm:

```bash
pnpm add react-hook-media
```

---

## Example

```jsx
import {
  useMatchMedia,
  configureNodeEnv,
  MatchMedia,
  MatchMediaHydrationProvider,
} from "react-hook-media";

const MyComponent = () => {
  const isDesktop = useMatchMedia("(min-width: 900px)");

  return (
    <div>
      {isDesktop ? "desktop" : "mobile"}
      <MatchMedia query="(width < 900px)" otherwise={"desktop"}>
        mobile
      </MatchMedia>
      <MatchMedia
        query={["(width < 576px)", "(width > 1024px)"]}
        render={(isMobile, isDesktop) =>
          isMobile ? "mobile" : isDesktop ? "desktop" : "tablet"
        }
      />
    </div>
  );
};

// code bellow is for server-side rendering, ignore it if you don't use it
const Page = ({ mediaHydrationCtx }) => (
  <MatchMediaHydrationProvider value={mediaHydrationCtx}>
    <MyComponent />
  </MatchMediaHydrationProvider>
);

export const getServerSideProps = async () => {
  return {
    props: {
      mediaHydrationCtx: configureNodeEnv({ width: 1000 }),
    },
  };
};
```

---

## API

- [useMatchMedia](#usematchmedia)
- [MatchMedia](#matchmedia)
- [configureNodeEnv](#configurenodeenv)
- [MatchMediaHydrationProvider](#matchmediahydrationprovider)

### useMatchMedia

```ts
const useMatchMedia: (mediaQuery: string) => boolean;
```

Custom hook that provides the functionality of the [matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) method as a React hook.

> In a Node environment, where media queries are not supported, you must use the [configureNodeEnv](#configurenodeenv) method to simulate different device conditions, like in [example](#example).

Returns `true` if the media query matches, `false` otherwise.

---

### MatchMedia

```ts
type MatchMediaProps<T extends string | string[] = string> = {
  /**
   * The media query to evaluate.
   */
  query: T;
} & (
  | (T extends string
      ? PropsWithChildren<{
          /**
           * The content to render if the media query does not match (optional).
           */
          otherwise?: ReactNode;
        }>
      : never)
  | {
      render(
        ...isMatched: T extends string | [string]
          ? [boolean]
          : {
              [key in keyof T]: boolean;
            }
      ): ReactNode;
    }
);

const MatchMedia: <const T extends string | string[]>(
  props: MatchMediaProps<T>
) => ReactNode;
```

Evaluates the provided media query and renders its `children` if the media query matches. Optionally, you can also provide an `otherwise` prop to specify the content to render if the media query does not match. Alternatively, you can provide a `render` prop to conditionally render content based on the media query evaluation.

> It uses the [useMatchMedia](#usematchmedia) hook under the hood

---

### configureNodeEnv

```ts
const configureNodeEnv: (
  config: MediaQueryEnvironmentConfig
) => MatchMediaHydrationContext;
```

Configures the Node environment for server-side rendering (SSR).

This function is used to set up the environment for the [useMatchMedia](#usematchmedia) hook when running React components on the server. It allows you to provide a custom configuration object to simulate different media query results.

The configuration object should contain properties that match the media query conditions you want to simulate. For example, if you configure it with `{ width: 768 }`, it will simulate the viewport width as if it were 768 pixels wide, affecting the results returned by [useMatchMedia](#usematchmedia) when evaluating media queries related to width.

Returns a `MatchMediaHydrationContext` object that should be passed to the [MatchMediaHydrationProvider](#matchmediahydrationprovider).

---

### MatchMediaHydrationProvider

```ts
type MatchMediaHydrationContext = Record<string, boolean>;

const MatchMediaHydrationProvider: Provider<MatchMediaHydrationContext>;
```

A React context provider component for hydrating match media values.

---

## License

MIT © [Krombik](https://github.com/Krombik)
