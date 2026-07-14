import { Sidebar } from "@/components/layout/sidebar";
import { SkipLink } from "@/components/layout/skip-link";
import { InteractiveBackground } from "@/components/background/interactive-background";
import { ActiveSectionProvider } from "@/components/navigation/active-section-provider";
import { getBackground, getNavigation, getProfile } from "@/lib/content";

type SiteShellProps = {
  children: React.ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const profile = getProfile();
  const navigation = getNavigation();
  const background = getBackground();

  return (
    <ActiveSectionProvider navigation={navigation}>
      <div className="relative min-h-screen bg-background">
        <SkipLink />
        <InteractiveBackground background={background} />
        <Sidebar profile={profile} navigation={navigation} />
        <div className="relative z-10 min-h-screen pt-header md:pl-sidebar md:pt-0">
          <main id="main-content" className="min-h-screen outline-none" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </ActiveSectionProvider>
  );
}
