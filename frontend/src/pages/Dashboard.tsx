import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, BriefcaseBusiness, Loader2, SearchX } from "lucide-react";
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
        description: "Role Harbor refreshed the stored dataset.",
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
    <div className="min-h-screen pb-20 text-foreground relative overflow-hidden">
      <div className="dashboard-bg" />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 border border-white/70 shadow-[0_8px_24px_rgba(148,163,184,0.14)] backdrop-blur-xl">
                <BriefcaseBusiness className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-display font-semibold text-slate-900">
                  Ranked Opportunities
                </h2>
                <p className="text-sm text-slate-500">
                  Review saved roles, filter the stream, and manage your pipeline.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isLoading ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading
                </span>
              ) : isError ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Error
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Ready
                </span>
              )}

              {!isLoading && data && (
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-xl">
                  {data.total} results
                </span>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="glass-surface rounded-[28px] px-6 py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-sky-600 mb-4" />
              <p>Loading saved opportunities from FastAPI...</p>
            </div>
          )}

          {isError && (
            <div className="rounded-[28px] border border-red-200 bg-white/75 px-6 py-20 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl flex flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load opportunities</h3>
              <p className="text-sm text-slate-500 max-w-md">
                {error?.message || "Check your FastAPI backend and try again."}
              </p>
            </div>
          )}

          {!isLoading && !isError && data?.jobs.length === 0 && (
            <div className="glass-surface rounded-[28px] px-6 py-24 flex flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200">
                <SearchX className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-display font-semibold text-slate-900 mb-2">
                No matching jobs found
              </h3>
              <p className="text-slate-500 max-w-sm">
                Try adjusting your filters, lowering the minimum score, or running a fetch to refresh the stored dataset.
              </p>
              <button
                onClick={() => setFilters({ sortBy: "score" })}
                className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
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
