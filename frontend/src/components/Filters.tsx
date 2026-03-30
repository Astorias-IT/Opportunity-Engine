import { Filter, Search, X } from "lucide-react";
import type { ListJobsParams } from "@/lib/api";

interface FiltersProps {
  filters: ListJobsParams;
  setFilters: (filters: ListJobsParams) => void;
  uniqueOptions: {
    sources: string[];
    roleClasses: string[];
    workModes: string[];
  };
  lastUpdated?: string | null;
}

export function Filters({ filters, setFilters, uniqueOptions, lastUpdated }: FiltersProps) {
  const updateFilter = <K extends keyof ListJobsParams>(key: K, value: ListJobsParams[K]) => {
    setFilters({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    setFilters({ sortBy: "score" });
  };

  const InputWrapper = ({ children, label }: { children: React.ReactNode; label: string }) => (
    <div className="flex flex-col gap-2">
      <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );

  const fieldClassName =
    "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur-xl outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

  return (
    <div
      className="glass-surface rounded-[30px] p-6 md:p-7 mb-6 animate-slide-up"
      style={{ animationDelay: "0.08s" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/80 shadow-sm">
            <Filter className="w-5 h-5 text-sky-600" />
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-slate-900">Refine Stream</h2>
            {lastUpdated && (
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Updated {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <InputWrapper label="Search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Keywords, company..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className={`${fieldClassName} pl-10`}
            />
          </div>
        </InputWrapper>

        <InputWrapper label="Source">
          <select
            value={filters.source || ""}
            onChange={(e) => updateFilter("source", e.target.value)}
            className={fieldClassName}
          >
            <option value="">All Sources</option>
            {uniqueOptions.sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Role Class">
          <select
            value={filters.roleClass || ""}
            onChange={(e) => updateFilter("roleClass", e.target.value)}
            className={fieldClassName}
          >
            <option value="">Any Role</option>
            {uniqueOptions.roleClasses.map((roleClass) => (
              <option key={roleClass} value={roleClass}>
                {roleClass}
              </option>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Status">
          <select
            value={filters.status || ""}
            onChange={(e) => updateFilter("status", (e.target.value as ListJobsParams["status"]) || undefined)}
            className={fieldClassName}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </InputWrapper>

        <InputWrapper label="Work Mode">
          <select
            value={filters.workMode || ""}
            onChange={(e) => updateFilter("workMode", e.target.value)}
            className={fieldClassName}
          >
            <option value="">Any Mode</option>
            {uniqueOptions.workModes.map((workMode) => (
              <option key={workMode} value={workMode}>
                {workMode}
              </option>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Location">
          <input
            type="text"
            placeholder="City, country..."
            value={filters.location || ""}
            onChange={(e) => updateFilter("location", e.target.value)}
            className={fieldClassName}
          />
        </InputWrapper>

        <InputWrapper label="Min Score">
          <input
            type="number"
            min="0"
            placeholder="0"
            value={typeof filters.minScore === "number" ? filters.minScore : ""}
            onChange={(e) => updateFilter("minScore", e.target.value ? Number(e.target.value) : null)}
            className={fieldClassName}
          />
        </InputWrapper>

        <InputWrapper label="Sort By">
          <select
            value={filters.sortBy || "score"}
            onChange={(e) => updateFilter("sortBy", e.target.value as ListJobsParams["sortBy"])}
            className={fieldClassName}
          >
            <option value="score">Highest Score</option>
            <option value="date">Most Recent</option>
            <option value="title">Job Title</option>
            <option value="company">Company</option>
          </select>
        </InputWrapper>
      </div>
    </div>
  );
}
