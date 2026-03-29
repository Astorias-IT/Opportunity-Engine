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
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border border-border">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground">Refine Stream</h2>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Updated {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <InputWrapper label="Search">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Keywords, company..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </InputWrapper>

        <InputWrapper label="Source">
          <select
            value={filters.source || ""}
            onChange={(e) => updateFilter("source", e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all text-foreground appearance-none"
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
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all text-foreground appearance-none"
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
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all text-foreground appearance-none"
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
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all text-foreground appearance-none"
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
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </InputWrapper>

        <InputWrapper label="Min Score">
          <input
            type="number"
            min="0"
            placeholder="0"
            value={typeof filters.minScore === "number" ? filters.minScore : ""}
            onChange={(e) => updateFilter("minScore", e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </InputWrapper>

        <InputWrapper label="Sort By">
          <select
            value={filters.sortBy || "score"}
            onChange={(e) => updateFilter("sortBy", e.target.value as ListJobsParams["sortBy"])}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all text-foreground appearance-none"
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
