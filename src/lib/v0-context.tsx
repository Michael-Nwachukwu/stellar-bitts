"use client";

import { createContext, use, ReactNode } from "react";

type V0ContextType = {
  isV0: boolean;
};

const V0Context = createContext<V0ContextType | undefined>(undefined);

type V0ProviderProps = {
  children: ReactNode;
  isV0: boolean;
};

export const V0Provider = ({ children, isV0 }: V0ProviderProps) => {
  return <V0Context value={{ isV0 }}>{children}</V0Context>;
};

export const useIsV0 = (): boolean => {
  const context = use(V0Context);
  if (context === undefined) {
    throw new Error("useIsV0 must be used within a V0Provider");
  }
  return context.isV0;
};
