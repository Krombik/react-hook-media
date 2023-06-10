import { FC, PropsWithChildren, ReactNode } from "react";
import useMatchMedia from "../useMatchMedia";

export type MatchMediaProps = PropsWithChildren<{
  /**
   * The media query to evaluate.
   */
  query: string;
  /**
   * The content to render if the media query does not match (optional).
   */
  otherwise?: ReactNode;
}>;

/**
 * Component that conditionally renders content based on a media query.
 *
 * The `MatchMedia` component evaluates the provided media query and renders its `children`
 * if the media query matches. Optionally, you can also provide an `otherwise` prop to specify
 * the content to render if the media query does not match.
 *
 * > It uses `useMatchMedia` under the hood
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
 */
const MatchMedia: FC<MatchMediaProps> = (props) =>
  (useMatchMedia(props.query) ? props.children : props.otherwise) || null;

export default MatchMedia;
