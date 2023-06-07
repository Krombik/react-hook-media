# react-hook-media

React Hook Media is a lightweight and tree-shakable library that provides tools for working with media queries in React applications. It allows you to easily incorporate responsive behavior and conditional rendering based on media query conditions.

The library also provides a server-side rendering (SSR) and testing compatibility feature through the [configureNodeEnv](#configurenodeenv) method. It allows you to configure the Node environment to simulate different media query results during server-side rendering or testing scenarios.

React Hook Media is simple to use and integrates seamlessly with React applications, providing a convenient way to handle media queries and create responsive UI components.

## Installation

using npm:

```
npm install --save react-hook-media
```

or yarn:

```
yarn add react-hook-media
```

---

## Example

```jsx
import {
  useMatchMedia,
  configureNodeEnv,
  MatchMediaHydrationProvider,
} from "react-hook-media";

const MyComponent = () => {
  const isDesktop = useMatchMedia("(min-width: 900px)");

  return <div>{isDesktop ? "This is desktop" : "This is mobile"}</div>;
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

Custom hook that implements the behavior of the [matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) method as a React hook.

> In a Node environment, this hook will always return `false` by default since media queries are not supported. However, you can customize the behavior of `useMatchMedia` by using the [configureNodeEnv](#configurenodeenv) method

Returns `true` if the media query matches, `false` otherwise.

---

### MatchMedia

```ts
type MatchMediaProps = PropsWithChildren<{
  /**
   * The media query to evaluate.
   */
  query: string;
  /**
   * The content to render if the media query does not match (optional).
   */
  otherwise?: ReactNode;
}>;

const MatchMedia: FC<MatchMediaProps>;
```

Evaluates the provided media query and renders its `children` if the media query matches. Optionally, you can also provide an `otherwise` prop to specify the content to render if the media query does not match.

> It uses the [useMatchMedia](#usematchmedia) hook under the hood

---

### configureNodeEnv

```ts
const configureNodeEnv: (
  config: MediaQueryEnvironmentConfig
) => MatchMediaHydrationContext;
```

Configures the Node environment for server-side rendering (SSR) or testing scenarios.

This function is used to set up the environment for the useMatchMedia hook when running React components on the server or in testing environments. It allows you to provide a custom configuration object to simulate different media query results.

The configuration object should contain properties that match the media query conditions you want to simulate. For example, if you configure it with `{ width: 768 }`, it will simulate the viewport width as if it were 768 pixels wide, affecting the results returned by useMatchMedia when evaluating media queries related to width.

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
