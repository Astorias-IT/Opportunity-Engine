import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/api";

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config: Record<JobStatus, { label: string; classes: string }> = {
    new: { label: "New", classes: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    applied: { label: "Applied", classes: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    interview: { label: "Interview", classes: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    rejected: { label: "Rejected", classes: "bg-red-500/10 text-red-400 border-red-500/20" },
    offer: { label: "Offer", classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  };

  const { label, classes } = config[status];

  return <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", classes, className)}>{label}</span>;
}
