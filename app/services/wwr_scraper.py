import requests

REMOTIVE_API_URL = "https://remotive.com/api/remote-jobs"

STRONG_NEGATIVE_KEYWORDS = [
    "marketing",
    "seo",
    "sales",
    "designer",
    "product manager",
    "frontend",
    "backend",
    "fullstack",
    "full-stack",
    "developer",
    "software engineer",
]


def _clean_text(value: str) -> str:
    if not value:
        return ""
    return " ".join(str(value).split()).strip()


def _should_skip_title(title: str) -> bool:
    if not title:
        return True

    lowered = title.lower().strip()
    return any(keyword in lowered for keyword in STRONG_NEGATIVE_KEYWORDS)


def _infer_location(job: dict) -> str:
    candidate_required_location = _clean_text(job.get("candidate_required_location") or "")
    job_type = _clean_text(job.get("job_type") or "")
    category = _clean_text(job.get("category") or "")

    parts = [part for part in [candidate_required_location, job_type, category] if part]
    return " | ".join(parts)


def fetch_remotive_jobs():
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
        )
    }

    try:
        response = requests.get(REMOTIVE_API_URL, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
    except Exception:
        return []

    jobs = []

    for job in data.get("jobs", []):
        title = _clean_text(job.get("title") or "")
        company = _clean_text(job.get("company_name") or "")
        link = _clean_text(job.get("url") or "")
        location = _infer_location(job)

        if not title or not company or not link:
            continue

        if _should_skip_title(title):
            continue

        jobs.append(
            {
                "title": title,
                "company": company,
                "link": link,
                "source": "remotive",
                "location": location,
                "work_mode": "remote",
            }
        )

    return jobs
