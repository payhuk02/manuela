import { createContext, useContext, ReactNode } from "react";
import { useSiteData, type SiteData } from "@/hooks/useSiteData";

const Ctx = createContext<SiteData | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const data = useSiteData();
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function useSite() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSite must be used within SiteDataProvider");
  return c;
}
