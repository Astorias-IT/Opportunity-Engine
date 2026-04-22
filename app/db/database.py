import sqlite3
from pathlib import Path
from typing import Any

DB_PATH = Path("data/jobs.db")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

JOB_STATUSES = {"new", "applied", "interview", "rejected", "offer"}


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            link TEXT NOT NULL UNIQUE,
            source TEXT,
            location TEXT,
            work_mode TEXT,
            score INTEGER DEFAULT 0,
            tags TEXT,
            role_class TEXT,
            status TEXT NOT NULL DEFAULT 'new',
            applied_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS fetch_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT,
            fetched_count INTEGER DEFAULT 0,
            inserted_count INTEGER DEFAULT 0,
            updated_count INTEGER DEFAULT 0,
            fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    existing_job_columns = {
        row["name"]
        for row in cursor.execute("PRAGMA table_info(jobs)").fetchall()
    }

    if "source" not in existing_job_columns:
        cursor.execute("ALTER TABLE jobs ADD COLUMN source TEXT")

    if "location" not in existing_job_columns:
        cursor.execute("ALTER TABLE jobs ADD COLUMN location TEXT")

    if "work_mode" not in existing_job_columns:
        cursor.execute("ALTER TABLE jobs ADD COLUMN work_mode TEXT")

    if "score" not in existing_job_columns:
        cursor.execute("ALTER TABLE jobs ADD COLUMN score INTEGER DEFAULT 0")

    if "tags" not in existing_job_columns:
        cursor.execute("ALTER TABLE jobs ADD COLUMN tags TEXT")

    if "role_class" not in existing_job_columns:
        cursor.execute("ALTER TABLE jobs ADD COLUMN role_class TEXT")

    if "status" not in existing_job_columns:
        cursor.execute("ALTER TABLE jobs ADD COLUMN status TEXT NOT NULL DEFAULT 'new'")

    if "applied_at" not in existing_job_columns:
        cursor.execute("ALTER TABLE jobs ADD COLUMN applied_at TIMESTAMP")

    if "first_seen" not in existing_job_columns:
        cursor.execute("ALTER TABLE jobs ADD COLUMN first_seen TIMESTAMP")

    if "last_seen" not in existing_job_columns:
        cursor.execute("ALTER TABLE jobs ADD COLUMN last_seen TIMESTAMP")

    existing_fetch_run_columns = {
        row["name"]
        for row in cursor.execute("PRAGMA table_info(fetch_runs)").fetchall()
    }

    if "source" not in existing_fetch_run_columns:
        cursor.execute("ALTER TABLE fetch_runs ADD COLUMN source TEXT")

    if "fetched_count" not in existing_fetch_run_columns:
        cursor.execute("ALTER TABLE fetch_runs ADD COLUMN fetched_count INTEGER DEFAULT 0")

    if "inserted_count" not in existing_fetch_run_columns:
        cursor.execute("ALTER TABLE fetch_runs ADD COLUMN inserted_count INTEGER DEFAULT 0")

    if "updated_count" not in existing_fetch_run_columns:
        cursor.execute("ALTER TABLE fetch_runs ADD COLUMN updated_count INTEGER DEFAULT 0")

    cursor.execute(
        """
        UPDATE jobs
        SET first_seen = COALESCE(first_seen, created_at, CURRENT_TIMESTAMP)
        WHERE first_seen IS NULL
        """
    )

    cursor.execute(
        """
        UPDATE jobs
        SET last_seen = COALESCE(last_seen, created_at, CURRENT_TIMESTAMP)
        WHERE last_seen IS NULL
        """
    )

    cursor.execute(
        """
        UPDATE jobs
        SET location = COALESCE(location, '')
        WHERE location IS NULL
        """
    )

    cursor.execute(
        """
        UPDATE jobs
        SET work_mode = COALESCE(work_mode, 'unknown')
        WHERE work_mode IS NULL OR TRIM(work_mode) = ''
        """
    )

    cursor.execute(
        """
        UPDATE jobs
        SET status = 'new'
        WHERE status IS NULL OR TRIM(status) = ''
        """
    )

    cursor.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_jobs_score_last_seen
        ON jobs(score DESC, last_seen DESC)
        """
    )

    cursor.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_jobs_role_class
        ON jobs(role_class)
        """
    )

    cursor.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_jobs_source
        ON jobs(source)
        """
    )

    cursor.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_jobs_work_mode
        ON jobs(work_mode)
        """
    )

    cursor.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_jobs_status
        ON jobs(status)
        """
    )

    conn.commit()
    conn.close()


def create_fetch_run(
    source: str | None = None,
    fetched_count: int = 0,
    inserted_count: int = 0,
    updated_count: int = 0,
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO fetch_runs (
            source,
            fetched_count,
            inserted_count,
            updated_count
        )
        VALUES (?, ?, ?, ?)
        """,
        (source, fetched_count, inserted_count, updated_count),
    )

    fetch_run_id = cursor.lastrowid

    cursor.execute(
        """
        SELECT
            id,
            source,
            fetched_count,
            inserted_count,
            updated_count,
            fetched_at
        FROM fetch_runs
        WHERE id = ?
        """,
        (fetch_run_id,),
    )

    row = cursor.fetchone()
    conn.commit()
    conn.close()

    return dict(row)


def _normalize_tags_value(tags_value: Any) -> str:
    if tags_value is None:
        return ""

    if isinstance(tags_value, list):
        return ",".join(str(tag).strip() for tag in tags_value if str(tag).strip())

    return str(tags_value).strip()


def _normalize_status_value(status_value: str | None) -> str:
    normalized = str(status_value or "new").strip().lower()
    if normalized not in JOB_STATUSES:
        raise ValueError(f"Invalid status: {normalized}")
    return normalized


def insert_jobs(jobs: list[dict]):
    conn = get_connection()
    cursor = conn.cursor()

    inserted_count = 0
    updated_count = 0

    for job in jobs:
        tags_value = _normalize_tags_value(job.get("tags", []))
        location_value = str(job.get("location", "") or "").strip()
        work_mode_value = str(job.get("work_mode", "unknown") or "unknown").strip().lower()

        try:
            cursor.execute(
                """
                INSERT INTO jobs (
                    title,
                    company,
                    link,
                    source,
                    location,
                    work_mode,
                    score,
                    tags,
                    role_class,
                    status,
                    applied_at,
                    first_seen,
                    last_seen
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """,
                (
                    job["title"],
                    job["company"],
                    job["link"],
                    job.get("source"),
                    location_value,
                    work_mode_value,
                    job.get("score", 0),
                    tags_value,
                    job.get("role_class"),
                    "new",
                    None,
                ),
            )
            inserted_count += 1

        except sqlite3.IntegrityError:
            cursor.execute(
                """
                UPDATE jobs
                SET
                    title = ?,
                    company = ?,
                    source = ?,
                    location = ?,
                    work_mode = ?,
                    score = ?,
                    tags = ?,
                    role_class = ?,
                    last_seen = CURRENT_TIMESTAMP
                WHERE link = ?
                """,
                (
                    job["title"],
                    job["company"],
                    job.get("source"),
                    location_value,
                    work_mode_value,
                    job.get("score", 0),
                    tags_value,
                    job.get("role_class"),
                    job["link"],
                ),
            )
            updated_count += 1

    conn.commit()
    conn.close()

    return {
        "inserted_count": inserted_count,
        "updated_count": updated_count,
        "total_processed": inserted_count + updated_count,
    }


def get_job_by_id(job_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            title,
            company,
            link,
            source,
            location,
            work_mode,
            score,
            tags,
            role_class,
            status,
            applied_at,
            created_at,
            first_seen,
            last_seen
        FROM jobs
        WHERE id = ?
        """,
        (job_id,),
    )

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    job = dict(row)
    job["is_new"] = job["first_seen"] == job["last_seen"]
    job["freshness"] = "new" if job["is_new"] else "seen_before"
    return job


def update_job_status(job_id: int, status: str):
    normalized_status = _normalize_status_value(status)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, status, applied_at FROM jobs WHERE id = ?", (job_id,))
    existing_row = cursor.fetchone()

    if existing_row is None:
        conn.close()
        return None

    if normalized_status == "applied":
        cursor.execute(
            """
            UPDATE jobs
            SET
                status = ?,
                applied_at = COALESCE(applied_at, CURRENT_TIMESTAMP)
            WHERE id = ?
            """,
            (normalized_status, job_id),
        )
    else:
        cursor.execute(
            """
            UPDATE jobs
            SET status = ?
            WHERE id = ?
            """,
            (normalized_status, job_id),
        )

    conn.commit()

    cursor.execute(
        """
        SELECT
            id,
            title,
            company,
            link,
            source,
            location,
            work_mode,
            score,
            tags,
            role_class,
            status,
            applied_at,
            created_at,
            first_seen,
            last_seen
        FROM jobs
        WHERE id = ?
        """,
        (job_id,),
    )

    updated_row = cursor.fetchone()
    conn.close()

    job = dict(updated_row)
    job["is_new"] = job["first_seen"] == job["last_seen"]
    job["freshness"] = "new" if job["is_new"] else "seen_before"
    return job


def mark_job_as_applied(job_id: int):
    return update_job_status(job_id=job_id, status="applied")


def mark_job_as_rejected(job_id: int):
    return update_job_status(job_id=job_id, status="rejected")


def get_all_jobs(
    min_score: int | None = None,
    tag: str | None = None,
    source: str | None = None,
    role_class: str | None = None,
    location: str | None = None,
    work_mode: str | None = None,
    status: str | None = None,
    limit: int | None = None,
):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            id,
            title,
            company,
            link,
            source,
            location,
            work_mode,
            score,
            tags,
            role_class,
            status,
            applied_at,
            created_at,
            first_seen,
            last_seen
        FROM jobs
        WHERE 1=1
    """
    params = []

    if min_score is not None:
        query += " AND score >= ?"
        params.append(min_score)

    if tag:
        query += " AND tags LIKE ?"
        params.append(f"%{tag}%")

    if source:
        query += " AND source = ?"
        params.append(source)

    if role_class:
        query += " AND role_class = ?"
        params.append(role_class)

    if location:
        query += " AND LOWER(location) LIKE ?"
        params.append(f"%{location.lower()}%")

    if work_mode:
        query += " AND LOWER(work_mode) = ?"
        params.append(work_mode.lower())

    if status:
        query += " AND LOWER(status) = ?"
        params.append(_normalize_status_value(status))

    query += " ORDER BY score DESC, last_seen DESC"

    if limit is not None:
        query += " LIMIT ?"
        params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    jobs = []
    for row in rows:
        job = dict(row)
        job["is_new"] = job["first_seen"] == job["last_seen"]
        job["freshness"] = "new" if job["is_new"] else "seen_before"
        jobs.append(job)

    return jobs


def get_fetch_runs(limit: int = 20):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            source,
            fetched_count,
            inserted_count,
            updated_count,
            fetched_at
        FROM fetch_runs
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]
