from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.scoring import score_job
from app.db.database import (
    JOB_STATUSES,
    create_fetch_run,
    get_all_jobs,
    get_fetch_runs,
    init_db,
    insert_jobs,
    mark_job_as_applied,
    mark_job_as_rejected,
)
from app.services.aggregator import scrape_all_jobs

app = FastAPI(title="opportunity-engine")

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
FRONTEND_DIST_DIR = FRONTEND_DIR / "dist"
FRONTEND_PUBLIC_DIR = FRONTEND_DIST_DIR / "public"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


if FRONTEND_PUBLIC_DIR.exists():
    assets_dir = FRONTEND_PUBLIC_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    images_dir = FRONTEND_PUBLIC_DIR / "images"
    if images_dir.exists():
        app.mount("/images", StaticFiles(directory=images_dir), name="images")

elif FRONTEND_DIR.exists():
    static_dir = FRONTEND_DIR / "static"
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
def root():
    built_index = FRONTEND_PUBLIC_DIR / "index.html"
    if built_index.exists():
        return FileResponse(built_index)

    dev_index = FRONTEND_DIR / "index.html"
    if dev_index.exists():
        return FileResponse(dev_index)

    return {"status": "ok", "message": "frontend not found"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/fetch")
def fetch():
    try:
        jobs = scrape_all_jobs()

        scored_jobs = []
        raw_source_counts: dict[str, int] = {}
        kept_source_counts: dict[str, int] = {}

        for job in jobs:
            source = job.get("source") or "unknown"
            raw_source_counts[source] = raw_source_counts.get(source, 0) + 1

            scored = score_job(
                job["title"],
                job["company"],
                job.get("source", ""),
                job.get("location", ""),
                job.get("work_mode", "unknown"),
            )

            enriched_job = {
                **job,
                "score": scored["score"],
                "tags": scored["tags"],
                "role_class": scored["role_class"],
            }

            if enriched_job["score"] < -5:
                continue

            scored_jobs.append(enriched_job)
            kept_source_counts[source] = kept_source_counts.get(source, 0) + 1

        write_result = insert_jobs(scored_jobs)

        fetch_run_rows = []
        if kept_source_counts:
            for source, fetched_count in kept_source_counts.items():
                fetch_run_rows.append(
                    create_fetch_run(
                        source=source,
                        fetched_count=fetched_count,
                        inserted_count=0,
                        updated_count=0,
                    )
                )
        else:
            fetch_run_rows.append(
                create_fetch_run(
                    source="all",
                    fetched_count=0,
                    inserted_count=0,
                    updated_count=0,
                )
            )

        return {
            "status": "ok",
            "fetched_count": len(jobs),
            "scored_count": len(scored_jobs),
            "dropped_count": len(jobs) - len(scored_jobs),
            "inserted_count": write_result["inserted_count"],
            "updated_count": write_result["updated_count"],
            "total_processed": write_result["total_processed"],
            "raw_source_counts": raw_source_counts,
            "kept_source_counts": kept_source_counts,
            "fetch_runs": fetch_run_rows,
            "jobs": scored_jobs,
        }
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": str(exc)},
        )


@app.get("/jobs")
def jobs(
    min_score: int | None = Query(default=None),
    tag: str | None = Query(default=None),
    source: str | None = Query(default=None),
    role_class: str | None = Query(default=None),
    location: str | None = Query(default=None),
    work_mode: str | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int | None = Query(default=100, ge=1, le=500),
):
    try:
        if status is not None and status.lower() not in JOB_STATUSES:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid status",
                    "allowed_statuses": sorted(JOB_STATUSES),
                },
            )

        data = get_all_jobs(
            min_score=min_score,
            tag=tag,
            source=source,
            role_class=role_class,
            location=location,
            work_mode=work_mode,
            status=status,
            limit=limit,
        )
        return {
            "count": len(data),
            "jobs": data,
        }
    except HTTPException:
        raise
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": str(exc)},
        )


@app.post("/jobs/{job_id}/apply")
def apply_to_job(job_id: int):
    try:
        updated_job = mark_job_as_applied(job_id)

        if updated_job is None:
            raise HTTPException(status_code=404, detail="Job not found")

        return {
            "status": "ok",
            "message": "Job marked as applied",
            "job": updated_job,
        }
    except HTTPException:
        raise
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": str(exc)},
        )


@app.post("/jobs/{job_id}/reject")
def reject_job(job_id: int):
    try:
        updated_job = mark_job_as_rejected(job_id)

        if updated_job is None:
            raise HTTPException(status_code=404, detail="Job not found")

        return {
            "status": "ok",
            "message": "Job marked as rejected",
            "job": updated_job,
        }
    except HTTPException:
        raise
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": str(exc)},
        )


@app.get("/fetch-runs")
def fetch_runs(limit: int = Query(default=20, ge=1, le=100)):
    try:
        data = get_fetch_runs(limit=limit)
        return {
            "count": len(data),
            "fetch_runs": data,
        }
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": str(exc)},
        )


@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    built_index = FRONTEND_PUBLIC_DIR / "index.html"
    if built_index.exists():
        return FileResponse(built_index)

    dev_index = FRONTEND_DIR / "index.html"
    if dev_index.exists():
        return FileResponse(dev_index)

    raise HTTPException(status_code=404, detail="Not Found")
