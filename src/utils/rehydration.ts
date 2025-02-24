import { createContext } from "react";
import type { MatchMediaHydrationContext } from "../configureNodeEnv";

export const RehydrationContext = createContext<
  MatchMediaHydrationContext | undefined
>(undefined);
