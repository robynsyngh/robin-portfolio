"use client";

import { Button } from "@/components/ui";

type ResumeActionsProps = {
  resumePath: string;
  fileName: string;
};

export function ResumeActions({ resumePath, fileName }: ResumeActionsProps) {
  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <Button href={resumePath} download={fileName} variant="primary">
        Download PDF
      </Button>
      <Button type="button" variant="secondary" onClick={() => window.print()}>
        Print
      </Button>
    </div>
  );
}
