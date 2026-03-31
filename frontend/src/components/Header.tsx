import { Activity, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/lib/api";

interface HeaderProps {
  stats: DashboardStats;
  statsLoading: boolean;
  onRunFetch: () => void;
  onReload: () => void;
  isFetching: boolean;
}

export function Header({
  stats,
  statsLoading,
  onRunFetch,
  onReload,
  isFetching,
}: HeaderProps) {
  const StatCard = ({
    label,
    value,
    loading,
  }: {
    label: string;
    value?: string | number | null;
    loading?: boolean;
  }) => {
    const isLongValue = typeof value === "string" && value.length > 7;

    return (
      <div className="rounded-3xl border border-white/70 bg-white/65 p-4 shadow-[0_20px_50px_rgba(148,163,184,0.12)] backdrop-blur-2xl">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </span>

        {loading ? (
          <div className="h-8 w-14 animate-pulse rounded-xl bg-slate-200" />
        ) : (
          <span
            className={cn(
              "block font-display font-semibold text-slate-900",
              isLongValue ? "break-words text-base leading-tight" : "text-3xl",
            )}
          >
            {value ?? "-"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="glass-surface relative mb-8 overflow-hidden rounded-[32px] p-6 md:p-8 lg:p-10 animate-fade-in">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute top-8 right-0 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-cyan-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:gap-10">
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="mb-6">
              <img
                src={`${import.meta.env.BASE_URL}images/roleharbor-logo.png?v=4`}
                alt="Role Harbor Logo"
                className="block h-auto w-full max-w-[260px] object-contain md:max-w-[340px] lg:max-w-[420px]"
              />

              <p className="mt-4 text-sm font-medium text-sky-700 md:text-base">
                Job aggregation and application tracking
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onRunFetch}
              disabled={isFetching}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white",
                "bg-[linear-gradient(135deg,#60a5fa_0%,#3b82f6_55%,#2563eb_100%)]",
                "shadow-[0_18px_36px_rgba(59,130,246,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(59,130,246,0.26)]",
                "disabled:cursor-not-allowed disabled:transform-none disabled:opacity-70",
              )}
            >
              {isFetching ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              {isFetching ? "Fetching Data..." : "Run Global Fetch"}
            </button>

            <button
              onClick={onReload}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Reload DB
            </button>
          </div>
        </div>

        <div className="w-full flex-1 lg:max-w-xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            <StatCard label="Total Jobs" value={stats.totalJobs} loading={statsLoading} />
            <StatCard label="High Score" value={stats.highScore} loading={statsLoading} />
            <StatCard label="Sources" value={stats.sources} loading={statsLoading} />
            <StatCard label="Top Role" value={stats.topRoleClass} loading={statsLoading} />
            <StatCard label="Applied" value={stats.applied} loading={statsLoading} />
            <StatCard label="Interview" value={stats.interview} loading={statsLoading} />
            <StatCard label="Offer" value={stats.offer} loading={statsLoading} />
            <StatCard label="Rejected" value={stats.rejected} loading={statsLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
