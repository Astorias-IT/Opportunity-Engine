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

  return (
    <div
      className="group bg-card hover:bg-card/80 border border-border rounded-2xl p-5 md:p-6 transition-all duration-300 shadow-sm hover:shadow-lg hover:border-border/80 flex flex-col justify-between animate-slide-up"
      style={{ animationDelay: `${0.15 + index * 0.05}s` }}
    >
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-display font-semibold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              <Building2 className="w-4 h-4" />
              <span className="truncate">{job.company}</span>
            </div>
          </div>
          <ScoreBadge score={job.score} className="shrink-0" />
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <StatusBadge status={job.status} />
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
            {job.source}
          </span>
          {job.role_class && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
              {job.role_class}
            </span>
          )}
          {job.work_mode && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
              {job.work_mode}
            </span>
          )}
          {job.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-background text-muted-foreground border border-border">
              {tag}
            </span>
          ))}
          {job.tags.length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-background text-muted-foreground border border-border">
              +{job.tags.length - 3}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 bg-background/50 rounded-xl p-3 border border-border/50">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Location</span>
              <span className="text-sm text-foreground truncate" title={job.location || "Unknown"}>
                {job.location || "Unknown"}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Work Mode</span>
              <span className="text-sm text-foreground truncate">{job.work_mode || "Unknown"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50 mt-auto">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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
            <div className="flex items-center gap-1.5 text-purple-400">
              <Check className="w-3.5 h-3.5" />
              <span>Applied {formatRelativeDate(job.applied_at)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {job.link && (
            <a
              href={job.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-colors hover-elevate text-sm"
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
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm disabled:opacity-60"
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
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-primary/20 disabled:opacity-60"
            >
              {applyMutation.isPending ? "Applying..." : "Apply"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
