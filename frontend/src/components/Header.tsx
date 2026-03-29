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
  const StatCard = ({ label, value, loading }: { label: string; value?: string | number | null; loading?: boolean }) => {
    const isLongValue = typeof value === "string" && value.length > 5;

    return (
      <div className="bg-background/40 border border-border/50 rounded-xl p-3 md:p-4 flex flex-col justify-between hover-elevate overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 z-10">{label}</span>
        <div className="z-10 min-h-8">
          {loading ? (
            <div className="h-7 w-12 bg-muted/50 rounded animate-pulse" />
          ) : (
            <span
              className={cn(
                "font-display font-bold text-foreground",
                isLongValue ? "text-sm leading-tight break-words" : "text-2xl md:text-3xl",
              )}
            >
              {value ?? "-"}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden mb-8 animate-fade-in"
      style={{
        background: "rgba(10, 15, 30, 0.80)",
        backdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}images/header-bg.png`}
          alt="Header Background"
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(13,27,62,0.6) 0%, rgba(10,15,30,0.8) 50%, rgba(10,15,30,1) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.4,
          }}
        />
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={`${import.meta.env.BASE_URL}images/oe-logo.svg`}
                alt="OE Logo"
                className="w-12 h-12 rounded-xl shadow-lg shadow-primary/20"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white text-glow">Opportunity Engine</h1>
                <p className="text-primary/80 font-medium">Job aggregation and application tracking</p>
              </div>
            </div>

            <p className="text-muted-foreground max-w-lg leading-relaxed text-sm md:text-base">
              A centralized dashboard for stored opportunities. Refresh sources with FastAPI, review ranked roles, and track the pipeline from new to offer without changing your backend contract.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={onRunFetch}
              disabled={isFetching}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300",
                "bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
                isFetching && "opacity-70 cursor-not-allowed transform-none",
              )}
            >
              {isFetching ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              {isFetching ? "Fetching Data..." : "Run Global Fetch"}
            </button>
            <button
              onClick={onReload}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-white/5 hover:bg-white/10 text-white border border-white/15 transition-all active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload DB
            </button>
          </div>
        </div>

        <div className="flex-1 lg:max-w-xl w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 h-full">
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
