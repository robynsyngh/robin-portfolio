"use client";

import dynamic from "next/dynamic";
import { EasterEggProvider } from "@/components/easter-eggs/easter-egg-context";
import { PortfolioLoader } from "@/components/loader/portfolio-loader";
import { SmoothScroll } from "@/components/smooth-scroll";
import type { EasterEggsContent, LoaderContent } from "@/lib/types";

const DeveloperModeHud = dynamic(
  () =>
    import("@/components/easter-eggs/developer-mode-hud").then(
      (module) => module.DeveloperModeHud,
    ),
  { ssr: false },
);

const UnlockToast = dynamic(
  () =>
    import("@/components/easter-eggs/unlock-toast").then(
      (module) => module.UnlockToast,
    ),
  { ssr: false },
);

const RubberDuck = dynamic(
  () =>
    import("@/components/easter-eggs/rubber-duck").then(
      (module) => module.RubberDuck,
    ),
  { ssr: false },
);

const CustomCursor = dynamic(
  () =>
    import("@/components/cursor/custom-cursor").then(
      (module) => module.CustomCursor,
    ),
  { ssr: false },
);

type ProvidersProps = {
  loader: LoaderContent;
  easterEggs: EasterEggsContent;
  children: React.ReactNode;
};

export function Providers({ loader, easterEggs, children }: ProvidersProps) {
  return (
    <SmoothScroll>
      <EasterEggProvider easterEggs={easterEggs}>
        <PortfolioLoader loader={loader}>{children}</PortfolioLoader>
        <DeveloperModeHud />
        <UnlockToast />
        <RubberDuck />
        <CustomCursor />
      </EasterEggProvider>
    </SmoothScroll>
  );
}
