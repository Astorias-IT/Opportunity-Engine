import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Building2, Calendar, Check, ExternalLink, MapPin, X } from "lucide-react";
import { applyJob, rejectJob, type Job } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeDate } from "@/lib/utils";
import { ScoreBadge } from "./ui/ScoreBadge";
import { StatusBadge } from "./ui/StatusBadge";

interface JobCardProps {
  job: Job;
  index: number;
}

export function JobCard({ job, index }: JobCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const applyMutation = useMutation({
    mutationFn: () => applyJob(job.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "Job updated",
        description: "The job was marked as applied.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Apply failed",
        description: error.message,
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectJob(job.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "Job updated",
        description: "The job was moved to rejected.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Reject failed",
        description: error.message,
      });
    },
  });

  const canApply = job.status === "new";
  const canReject = job.status === "new" || job.status === "applied" || job.status === "interview";

  const chipClass =
    "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600";

  return (
    <div
      className="group glass-surface rounded-[28px] p-5 md:p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(148,163,184,0.18)] animate-slide-up flex flex-col justify-between"
      style={{ animationDelay: `${0.12 + index * 0.04}s` }}
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="mb-1 text-lg md:text-xl font-display font-semibold leading-tight text-slate-900 transition group-hover:text-sky-700">
              {job.title}
            </h3>

            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Building2 className="w-4 h-4" />
              <span className="truncate">{job.company}</span>
            </div>
          </div>

          <ScoreBadge score={job.score} className="shrink-0" />
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <StatusBadge status={job.status} />

          <span className={chipClass}>{job.source}</span>

          {job.role_class && <span className={chipClass}>{job.role_class}</span>}
          {job.work_mode && <span className={chipClass}>{job.work_mode}</span>}

          {job.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
              {tag}
            </span>
          ))}

          {job.tags.length > 3 && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
              +{job.tags.length - 3}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-500" />
            </div>

            <div className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Location
              </span>
              <span className="block truncate text-sm text-slate-700" title={job.location || "Unknown"}>
                {job.location || "Unknown"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
              <Briefcase className="w-4 h-4 text-slate-500" />
            </div>

            <div className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Work Mode
              </span>
              <span className="block truncate text-sm text-slate-700">
                {job.work_mode || "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-200/80 pt-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>First seen {formatRelativeDate(job.first_seen)}</span>
            </div>

            {job.last_seen && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Last seen {formatRelativeDate(job.last_seen)}</span>
              </div>
            )}

            {job.applied_at && (
              <div className="flex items-center gap-1.5 text-sky-700">
                <Check className="w-3.5 h-3.5" />
                <span>Applied {formatRelativeDate(job.applied_at)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {job.link && (
              <a
                href={job.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                title="Open original listing"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
            )}

            {canReject && (
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                title="Reject"
              >
                <X className="w-4 h-4" />
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </button>
            )}

            {canApply && (
              <button
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
                className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#60a5fa_0%,#3b82f6_55%,#2563eb_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(59,130,246,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(59,130,246,0.24)] disabled:opacity-60"
              >
                {applyMutation.isPending ? "Applying..." : "Apply"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
