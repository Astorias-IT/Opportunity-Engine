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

export function Header({ stats, statsLoading, onRunFetch, onReload, isFetching }: HeaderProps) {
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
          <div className="h-8 w-14 rounded-xl bg-slate-200 animate-pulse" />
        ) : (
          <span
            className={cn(
              "block font-display font-semibold text-slate-900",
              isLongValue ? "text-base leading-tight break-words" : "text-3xl",
            )}
          >
            {value ?? "-"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="glass-surface rounded-[32px] p-6 md:p-8 lg:p-10 mb-8 animate-fade-in overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute top-8 right-0 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-cyan-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-10">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 border border-white/80 shadow-[0_12px_30px_rgba(59,130,246,0.12)]">
                <img
                  src={`${import.meta.env.BASE_URL}images/oe-logo.svg`}
                  alt="OE Logo"
                  className="w-10 h-10"
                />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-display font-semibold text-slate-900 leading-tight">
                  Opportunity Engine
                </h1>
                <p className="mt-1 text-sm md:text-base font-medium text-sky-700">
                  Job aggregation and application tracking
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm md:text-base leading-7 text-slate-600">
              A centralized dashboard for stored opportunities. Refresh sources with FastAPI,
              review ranked roles, and track the pipeline from new to offer with a cleaner,
              lighter workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={onRunFetch}
              disabled={isFetching}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white",
                "bg-[linear-gradient(135deg,#60a5fa_0%,#3b82f6_55%,#2563eb_100%)]",
                "shadow-[0_18px_36px_rgba(59,130,246,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(59,130,246,0.26)]",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none",
              )}
            >
              {isFetching ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              {isFetching ? "Fetching Data..." : "Run Global Fetch"}
            </button>

            <button
              onClick={onReload}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload DB
            </button>
          </div>
        </div>

        <div className="flex-1 lg:max-w-xl w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
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
