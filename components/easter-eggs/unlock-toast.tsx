"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEasterEggs } from "@/components/easter-eggs/easter-egg-context";

export function UnlockToast() {
  const { toast, dismissToast } = useEasterEggs();

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 z-[80] w-[min(92vw,24rem)] -translate-x-1/2 border border-border bg-surface px-4 py-3 md:bottom-8"
          role="status"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">
                Unlocked
              </p>
              <p className="mt-2 font-mono text-sm text-foreground">{toast.title}</p>
              <p className="mt-1 text-sm text-muted">{toast.message}</p>
            </div>
            <button
              type="button"
              data-cursor-text="close"
              onClick={dismissToast}
              className="font-mono text-xs text-muted transition-colors hover:text-foreground"
            >
              Close
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
