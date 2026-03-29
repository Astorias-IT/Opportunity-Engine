import requests
from datetime import datetime

from app.services.scraper_tecnoempleo import scrape_tecnoempleo
from app.services.scraper_wwr import scrape_wwr
from app.services.wwr_scraper import fetch_remotive_jobs

REMOTEOK_URL = "https://remoteok.com/api"


def infer_remoteok_location(job: dict) -> str:
    parts = []

    location = (job.get("location") or "").strip()
    if location:
        parts.append(location)

    tags = job.get("tags") or []
    if isinstance(tags, list):
        lower_tags = [str(tag).strip() for tag in tags if str(tag).strip()]
        for tag in lower_tags:
            tag_lower = tag.lower()
            if tag_lower in {
                "spain",
                "barcelona",
                "madrid",
                "valencia",
                "europe",
                "eu",
                "worldwide",
                "remote",
            }:
                parts.append(tag)

    candidate = " | ".join(dict.fromkeys(parts))
    return candidate.strip()


def infer_remoteok_work_mode(job: dict) -> str:
    tags = job.get("tags") or []
    lower_tags = {str(tag).strip().lower() for tag in tags if str(tag).strip()}

    if "hybrid" in lower_tags:
        return "hybrid"

    if "onsite" in lower_tags or "on-site" in lower_tags:
        return "onsite"

    return "remote"


def fetch_remoteok_jobs():
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
        )
    }

    try:
        response = requests.get(REMOTEOK_URL, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
    except Exception:
        return []

    jobs = []

    for job in data[1:]:
        title = (job.get("position") or "").strip()
        company = (job.get("company") or "").strip()
        link = (job.get("url") or "").strip()
        location = infer_remoteok_location(job)
        work_mode = infer_remoteok_work_mode(job)

        if not title or not company or not link:
            continue

        jobs.append(
            {
                "title": title,
                "company": company,
                "link": link,
                "source": "remoteok",
                "location": location,
                "work_mode": work_mode,
            }
        )

    return jobs


def normalize_job(job: dict) -> dict:
    now = datetime.utcnow()
    return {
        "title": (job.get("title") or "").strip(),
        "company": (job.get("company") or "").strip(),
        "link": (job.get("link") or "").strip(),
        "source": (job.get("source") or "").strip(),
        "location": (job.get("location") or "").strip(),
        "work_mode": (job.get("work_mode") or "unknown").strip().lower(),
        "first_seen": now,
        "last_seen": now,
    }


def scrape_all_jobs():
    remoteok_jobs = fetch_remoteok_jobs()
    remotive_jobs = fetch_remotive_jobs()
    tecnoempleo_jobs = scrape_tecnoempleo()
    wwr_jobs = scrape_wwr()

    raw_jobs = remoteok_jobs + remotive_jobs + tecnoempleo_jobs + wwr_jobs
    normalized_jobs = []
    seen_links = set()

    for job in raw_jobs:
        normalized = normalize_job(job)

        if not normalized["title"] or not normalized["company"] or not normalized["link"]:
            continue

        if normalized["link"] in seen_links:
            continue

        seen_links.add(normalized["link"])
        normalized_jobs.append(normalized)

    return normalized_jobs
