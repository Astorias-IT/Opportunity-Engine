import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Database, Loader2, SearchX } from "lucide-react";
import { Header } from "@/components/Header";
import { Filters } from "@/components/Filters";
import { JobCard } from "@/components/JobCard";
import { computeStats, getJobs, getFetchRuns, runFetch, type ListJobsParams } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const [filters, setFilters] = useState<ListJobsParams>({
    sortBy: "score",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const jobsQuery = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => getJobs(filters),
    staleTime: 1000 * 60,
  });

  const allJobsQuery = useQuery({
    queryKey: ["jobs", "all-stats"],
    queryFn: () => getJobs({ sortBy: "score", status: "all" }),
    staleTime: 1000 * 60,
  });

  useQuery({
    queryKey: ["fetch-runs"],
    queryFn: () => getFetchRuns(),
    staleTime: 1000 * 60,
    retry: false,
  });

  const fetchMutation = useMutation({
    mutationFn: runFetch,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["fetch-runs"] }),
      ]);
      toast({
        title: "Fetch complete",
        description: "Opportunity Engine refreshed the stored dataset.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Fetch failed",
        description: error.message || "Could not run /fetch.",
      });
    },
  });

  const uniqueOptions = useMemo(() => {
    const jobs = allJobsQuery.data?.jobs ?? [];
    return {
      sources: Array.from(new Set(jobs.map((job) => job.source).filter(Boolean))).sort(),
      roleClasses: Array.from(new Set(jobs.map((job) => job.role_class).filter(Boolean))).sort(),
      workModes: Array.from(new Set(jobs.map((job) => job.work_mode).filter(Boolean))).sort(),
    };
  }, [allJobsQuery.data?.jobs]);

  const stats = useMemo(() => computeStats(allJobsQuery.data?.jobs ?? []), [allJobsQuery.data?.jobs]);

  const isLoading = jobsQuery.isLoading;
  const isError = jobsQuery.isError;
  const error = jobsQuery.error as Error | null;
  const data = jobsQuery.data;

  return (
    <div className="min-h-screen text-foreground pb-20" style={{ background: "transparent" }}>
      <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "hsl(222, 47%, 5%)" }}>
        <div
          style={{
            position: "absolute",
            borderRadius: "9999px",
            pointerEvents: "none",
            width: "750px",
            height: "750px",
            top: "-220px",
            left: "-180px",
            background:
              "radial-gradient(circle, rgba(79,70,229,0.32) 0%, rgba(99,102,241,0.12) 45%, transparent 72%)",
            filter: "blur(80px)",
            animation: "floatOrb1 22s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            borderRadius: "9999px",
            pointerEvents: "none",
            width: "650px",
            height: "650px",
            top: "10%",
            right: "-130px",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(167,139,250,0.10) 45%, transparent 72%)",
            filter: "blur(80px)",
            animation: "floatOrb2 28s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            borderRadius: "9999px",
            pointerEvents: "none",
            width: "580px",
            height: "580px",
            bottom: "0%",
            left: "22%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.24) 0%, rgba(96,165,250,0.08) 45%, transparent 72%)",
            filter: "blur(80px)",
            animation: "floatOrb3 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            borderRadius: "9999px",
            pointerEvents: "none",
            width: "460px",
            height: "460px",
            bottom: "20%",
            right: "12%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(52,211,153,0.06) 45%, transparent 72%)",
            filter: "blur(80px)",
            animation: "floatOrb4 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          stats={stats}
          statsLoading={allJobsQuery.isLoading}
          onReload={() => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            queryClient.invalidateQueries({ queryKey: ["fetch-runs"] });
            toast({
              title: "Data refreshed",
              description: "Latest records reloaded from SQLite through /jobs.",
            });
          }}
          onRunFetch={() => fetchMutation.mutate()}
          isFetching={fetchMutation.isPending}
        />

        <Filters
          filters={filters}
          setFilters={setFilters}
          uniqueOptions={uniqueOptions}
          lastUpdated={data?.lastUpdated ?? allJobsQuery.data?.lastUpdated ?? null}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Ranked Opportunities
            </h2>
            <div className="flex items-center gap-3">
              {isLoading ? (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading
                </span>
              ) : isError ? (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" /> Error
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Ready
                </span>
              )}
              {!isLoading && data && (
                <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
                  {data.total} results
                </span>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p>Loading saved opportunities from FastAPI...</p>
            </div>
          )}

          {isError && (
            <div className="py-20 flex flex-col items-center justify-center text-red-400 bg-red-500/5 rounded-2xl border border-red-500/10">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Failed to load opportunities</h3>
              <p className="text-sm opacity-70">{error?.message || "Check your FastAPI backend and try again."}</p>
            </div>
          )}

          {!isLoading && !isError && data?.jobs.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center bg-card/30 rounded-2xl border border-dashed border-border">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <SearchX className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">No matching jobs found</h3>
              <p className="text-muted-foreground max-w-sm">
                Try adjusting your filters, lowering the minimum score, or running a fetch to refresh the stored dataset.
              </p>
              <button
                onClick={() => setFilters({ sortBy: "score" })}
                className="mt-6 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!isLoading && !isError && data?.jobs && data.jobs.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              {data.jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
