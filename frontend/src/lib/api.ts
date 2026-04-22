export type JobStatus = "new" | "applied" | "interview" | "rejected" | "offer";
export type SortBy = "score" | "date" | "title" | "company";

export interface Job {
  id: number;
  title: string;
  company: string;
  link: string | null;
  source: string;
  location: string | null;
  work_mode: string | null;
  score: number;
  tags: string[];
  role_class: string | null;
  status: JobStatus;
  applied_at: string | null;
  first_seen: string | null;
  last_seen: string | null;
}

export interface ListJobsParams {
  search?: string;
  source?: string;
  roleClass?: string;
  workMode?: string;
  status?: JobStatus | "all" | "";
  location?: string;
  minScore?: number | null;
  sortBy?: SortBy;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  lastUpdated: string | null;
}

export interface DashboardStats {
  totalJobs: number;
  highScore: number;
  sources: number;
  topRoleClass: string | null;
  applied: number;
  interview: number;
  rejected: number;
  offer: number;
}

interface RawJob {
  id?: number | string;
  title?: string;
  company?: string;
  link?: string | null;
  url?: string | null;
  source?: string;
  location?: string | null;
  work_mode?: string | null;
  workMode?: string | null;
  score?: number | string | null;
  tags?: string[] | string | null;
  role_class?: string | null;
  roleClass?: string | null;
  status?: string | null;
  applied_at?: string | null;
  appliedAt?: string | null;
  first_seen?: string | null;
  firstSeen?: string | null;
  last_seen?: string | null;
  lastSeen?: string | null;
}

interface JobActionResponse {
  status?: string;
  message?: string;
  job?: RawJob;
}

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/$/, "");

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      if (typeof data?.detail === "string") message = data.detail;
      else if (typeof data?.error === "string") message = data.error;
      else if (typeof data?.message === "string") message = data.message;
    } catch {
      // ignore JSON parsing failures for error payloads
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function toStringArray(value: RawJob["tags"]): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeStatus(status: string | null | undefined): JobStatus {
  const value = (status ?? "new").toLowerCase();
  if (value === "applied" || value === "interview" || value === "rejected" || value === "offer") {
    return value;
  }
  return "new";
}

function normalizeJob(raw: RawJob): Job {
  return {
    id: Number(raw.id ?? 0),
    title: raw.title?.trim() || "Untitled role",
    company: raw.company?.trim() || "Unknown company",
    link: raw.link ?? raw.url ?? null,
    source: raw.source?.trim() || "unknown",
    location: raw.location ?? null,
    work_mode: raw.work_mode ?? raw.workMode ?? null,
    score: Number(raw.score ?? 0),
    tags: toStringArray(raw.tags),
    role_class: raw.role_class ?? raw.roleClass ?? null,
    status: normalizeStatus(raw.status),
    applied_at: raw.applied_at ?? raw.appliedAt ?? null,
    first_seen: raw.first_seen ?? raw.firstSeen ?? null,
    last_seen: raw.last_seen ?? raw.lastSeen ?? null,
  };
}

function sortJobs(jobs: Job[], sortBy: SortBy = "score"): Job[] {
  const cloned = [...jobs];

  cloned.sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "company") return a.company.localeCompare(b.company);
    if (sortBy === "date") {
      const aDate = new Date(a.last_seen ?? a.first_seen ?? 0).getTime();
      const bDate = new Date(b.last_seen ?? b.first_seen ?? 0).getTime();
      return bDate - aDate;
    }
    return b.score - a.score;
  });

  return cloned;
}

function matchesSearch(job: Job, search: string): boolean {
  const needle = search.toLowerCase();
  return [
    job.title,
    job.company,
    job.source,
    job.location ?? "",
    job.role_class ?? "",
    job.work_mode ?? "",
    ...job.tags,
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function applyFilters(jobs: Job[], filters: ListJobsParams): Job[] {
  let filtered = [...jobs];

  if (filters.search?.trim()) {
    filtered = filtered.filter((job) => matchesSearch(job, filters.search!.trim()));
  }

  if (filters.source) {
    filtered = filtered.filter((job) => job.source === filters.source);
  }

  if (filters.roleClass) {
    filtered = filtered.filter((job) => job.role_class === filters.roleClass);
  }

  if (filters.workMode) {
    filtered = filtered.filter((job) => job.work_mode === filters.workMode);
  }

  if (filters.location?.trim()) {
    const needle = filters.location.trim().toLowerCase();
    filtered = filtered.filter((job) => (job.location ?? "").toLowerCase().includes(needle));
  }

  if (typeof filters.minScore === "number") {
    filtered = filtered.filter((job) => job.score >= filters.minScore!);
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((job) => job.status === filters.status);
  } else {
    filtered = filtered.filter((job) => job.status !== "rejected");
  }

  return sortJobs(filtered, filters.sortBy ?? "score");
}

export async function getHealth(): Promise<{ status: string; app?: string }> {
  return request<{ status: string; app?: string }>("/api/health");
}

export async function getJobs(filters: ListJobsParams = {}): Promise<JobsResponse> {
  const raw = await request<RawJob[] | { jobs?: RawJob[]; count?: number }>("/api/jobs");
  const baseJobs = Array.isArray(raw) ? raw : Array.isArray(raw?.jobs) ? raw.jobs : [];
  const jobs = baseJobs.map(normalizeJob);
  const filteredJobs = applyFilters(jobs, filters);

  const lastUpdated = jobs.reduce<string | null>((latest, job) => {
    const candidate = job.last_seen ?? job.first_seen;
    if (!candidate) return latest;
    if (!latest) return candidate;
    return new Date(candidate).getTime() > new Date(latest).getTime() ? candidate : latest;
  }, null);

  return {
    jobs: filteredJobs,
    total: filteredJobs.length,
    lastUpdated,
  };
}

export async function runFetch(): Promise<unknown> {
  return request("/api/fetch", { method: "POST" });
}

export async function applyJob(id: number): Promise<Job> {
  const raw = await request<JobActionResponse>(`/api/jobs/${id}/apply`, { method: "POST" });
  return normalizeJob(raw.job ?? {});
}

export async function rejectJob(id: number): Promise<Job> {
  const raw = await request<JobActionResponse>(`/api/jobs/${id}/reject`, { method: "POST" });
  return normalizeJob(raw.job ?? {});
}

export async function getFetchRuns(): Promise<unknown> {
  return request("/api/fetch-runs");
}

export function computeStats(jobs: Job[]): DashboardStats {
  const roleCounts = new Map<string, number>();
  const sources = new Set<string>();

  for (const job of jobs) {
    sources.add(job.source);
    if (job.role_class) {
      roleCounts.set(job.role_class, (roleCounts.get(job.role_class) ?? 0) + 1);
    }
  }

  const topRoleClass = [...roleCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalJobs: jobs.length,
    highScore: jobs.reduce((max, job) => Math.max(max, job.score), 0),
    sources: sources.size,
    topRoleClass,
    applied: jobs.filter((job) => job.status === "applied").length,
    interview: jobs.filter((job) => job.status === "interview").length,
    rejected: jobs.filter((job) => job.status === "rejected").length,
    offer: jobs.filter((job) => job.status === "offer").length,
  };
}
