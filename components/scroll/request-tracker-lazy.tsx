"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ScrollProgressContent } from "@/lib/types";

const RequestTracker = dynamic(
  () =>
    import("@/components/scroll/request-tracker").then(
      (module) => module.RequestTracker,
    ),
  { ssr: false },
);

export function RequestTrackerLazy({
  progress,
}: {
  progress: ScrollProgressContent;
}) {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  return <RequestTracker progress={progress} />;
}
