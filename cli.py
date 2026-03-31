#!/usr/bin/env python3
import argparse
import sys
from typing import Any

import requests


API_BASE = "http://127.0.0.1:8000"


def fetch_jobs() -> None:
    response = requests.post(f"{API_BASE}/fetch", timeout=60)
    response.raise_for_status()
    data = response.json()

    print("\nFETCH RESULT")
    print("-" * 60)
    print(f"fetched_count   : {data.get('fetched_count', 0)}")
    print(f"scored_count    : {data.get('scored_count', 0)}")
    print(f"inserted_count  : {data.get('inserted_count', 0)}")
    print(f"updated_count   : {data.get('updated_count', 0)}")
    print(f"total_processed : {data.get('total_processed', 0)}")

    source_counts = data.get("source_counts", {})
    if source_counts:
        print("\nSOURCES")
        for source, count in source_counts.items():
            print(f"- {source}: {count}")


def list_jobs(limit: int, min_score: int | None, source: str | None, role_class: str | None, tag: str | None) -> None:
    params: dict[str, Any] = {"limit": limit}

    if min_score is not None:
        params["min_score"] = min_score
    if source:
        params["source"] = source
    if role_class:
        params["role_class"] = role_class
    if tag:
        params["tag"] = tag

    response = requests.get(f"{API_BASE}/jobs", params=params, timeout=30)
    response.raise_for_status()
    data = response.json()
    jobs = data.get("jobs", [])

    print(f"\nTOP JOBS, count={len(jobs)}")
    print("=" * 100)

    if not jobs:
        print("No jobs found.")
        return

    for index, job in enumerate(jobs, start=1):
        print(f"[{index:02}] score={job.get('score', 0):>3}  role={job.get('role_class', '-'):<10}  source={job.get('source', '-')}")
        print(f"     {job.get('title', '-')}")
        print(f"     {job.get('company', '-')}")
        print(f"     tags: {job.get('tags', '-')}")
        print(f"     freshness: {job.get('freshness', '-')}")
        print(f"     link: {job.get('link', '-')}")
        print("-" * 100)


def show_fetch_runs(limit: int) -> None:
    response = requests.get(f"{API_BASE}/fetch-runs", params={"limit": limit}, timeout=30)
    response.raise_for_status()
    data = response.json()
    runs = data.get("fetch_runs", [])

    print(f"\nFETCH RUNS, count={len(runs)}")
    print("=" * 100)

    if not runs:
        print("No fetch runs found.")
        return

    for run in runs:
        print(
            f"id={run.get('id')}  source={run.get('source')}  fetched={run.get('fetched_count')}  "
            f"inserted={run.get('inserted_count')}  updated={run.get('updated_count')}  at={run.get('fetched_at')}"
        )


def main() -> int:
    parser = argparse.ArgumentParser(description="Role Harbor CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("fetch", help="Trigger a fetch run")

    jobs_parser = subparsers.add_parser("jobs", help="List jobs")
    jobs_parser.add_argument("--limit", type=int, default=20)
    jobs_parser.add_argument("--min-score", type=int, default=None)
    jobs_parser.add_argument("--source", type=str, default=None)
    jobs_parser.add_argument("--role-class", type=str, default=None)
    jobs_parser.add_argument("--tag", type=str, default=None)

    runs_parser = subparsers.add_parser("runs", help="Show fetch runs")
    runs_parser.add_argument("--limit", type=int, default=20)

    args = parser.parse_args()

    try:
        if args.command == "fetch":
            fetch_jobs()
        elif args.command == "jobs":
            list_jobs(
                limit=args.limit,
                min_score=args.min_score,
                source=args.source,
                role_class=args.role_class,
                tag=args.tag,
            )
        elif args.command == "runs":
            show_fetch_runs(limit=args.limit)
        else:
            parser.print_help()
            return 1

        return 0
    except requests.RequestException as exc:
        print(f"API error: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\nInterrupted.", file=sys.stderr)
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
