import { PropsWithChildren, ReactNode } from "react";
import useMatchMedia from "../useMatchMedia";

type Props = PropsWithChildren<{
  /**
   * The content to render if the media query does not match (optional).
   */
  otherwise?: ReactNode;
}>;

export type MatchMediaProps<T extends string | string[] = string> = {
  /**
   * The media query to evaluate.
   */
  query: T;
} & (
  | (T extends string ? Props : never)
  | {
      render(
        ...isMatched: T extends string | [string]
          ? [boolean]
          : { [key in keyof T]: boolean }
      ): ReactNode;
    }
);

/**
 * Component that conditionally renders content based on a media query.
 *
 * Evaluates the provided media query and renders its `children` if the media query matches. Optionally, you can also provide an `otherwise` prop to specify the content to render if the media query does not match. Alternatively, you can provide a `render` prop to conditionally render content based on the media query evaluation.
 *
 * > It uses {@link useMatchMedia} under the hood
 *
 * @example
 * ```jsx
 * // Usage in a React component
 * <MatchMedia query="(max-width: 768px)">
 *   <MobileLayout />
 * </MatchMedia>
 * ```
 *
 * @example
 * ```jsx
 * // Usage with an "otherwise" prop
 * <MatchMedia query="(max-width: 768px)" otherwise={<DesktopLayout />}>
 *   <MobileLayout />
 * </MatchMedia>
 * ```
 *
 * @example
 * ```jsx
 * // Usage with an "render" prop
 * <MatchMedia
 *    query={["(width < 576px)", "(width > 1024px)"]}
 *    render={(isMobile, isDesktop) =>
 *      isMobile ? "mobile" : isDesktop ? "desktop" : "tablet"
 *    }
 * />
 * ```
 */
const MatchMedia = <const T extends string | string[]>(
  props: MatchMediaProps<T>
) => {
  const { query, render } = props as MatchMediaProps<string[]>;

  return render
    ? typeof query != "string"
      ? render(...query.map(useMatchMedia))
      : render(useMatchMedia(query))
    : (useMatchMedia(query as unknown as string)
        ? (props as Props).children
        : (props as Props).otherwise) || null;
};

export default MatchMedia;
