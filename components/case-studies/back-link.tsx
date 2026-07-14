"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { hasNavigatedWithinSession } from "@/lib/session-nav";
import { useActiveSectionContext } from "@/components/navigation/active-section-provider";

type BackLinkProps = {
  fallbackHref: string;
  children: React.ReactNode;
  className?: string;
};

function sectionIdFromHref(href: string) {
  return href.startsWith("/#") ? href.slice(2) : null;
}

export function BackLink({ fallbackHref, children, className }: BackLinkProps) {
  const router = useRouter();
  const { setActiveIdLocked } = useActiveSectionContext();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasNavigatedWithinSession()) {
      event.preventDefault();
      router.back();
      return;
    }

    // Landed here directly (fresh tab, refresh, or external link) — no
    // history to go back to. Lock scroll-spy on the target section before
    // the cross-page navigation kicks off, so it doesn't get overridden
    // mid-transition while the home page's sections are still settling.
    const sectionId = sectionIdFromHref(fallbackHref);
    if (sectionId) {
      setActiveIdLocked(sectionId, 3000);
    }
  };

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className={cn(
        "transition-opacity duration-200 text-muted hover:text-foreground hover:opacity-100",
        className,
      )}
    >
      {children}
    </Link>
  );
}
