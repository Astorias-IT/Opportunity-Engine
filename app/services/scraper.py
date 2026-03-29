from __future__ import annotations

from typing import Any

import requests

API_URL = "https://remoteok.io/api"

INCLUDE_KEYWORDS = [
    "it support",
    "technical support",
    "support engineer",
    "support specialist",
    "cloud support",
    "infrastructure support",
    "system administrator",
    "systems administrator",
    "sysadmin",
    "iam",
    "identity",
    "access management",
    "entra",
    "azure",
    "help desk",
    "service desk",
    "desktop support",
    "it administrator",
    "it specialist",
]

EXCLUDE_KEYWORDS = [
    "senior",
    "lead",
    "architect",
    "principal",
    "manager",
    "director",
    "head",
    "staff",
    "devops",
    "developer",
    "software engineer",
    "frontend",
    "backend",
    "full stack",
    "fullstack",
    "site reliability",
    "sre",
    "machine learning",
    "ai engineer",
    "data engineer",
    "platform engineer",
    "marketing",
    "sales",
    "recruiter",
]


def fetch_jobs_raw() -> list[dict[str, Any]]:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/145.0.0.0 Safari/537.36"
        )
    }

    response = requests.get(API_URL, headers=headers, timeout=30)
    response.raise_for_status()

    data = response.json()
    if not isinstance(data, list):
        return []

    return [item for item in data if isinstance(item, dict) and item.get("id")]


def normalize_text(*parts: str) -> str:
    return " ".join(part.strip().lower() for part in parts if part and part.strip())


def is_relevant_job(title: str, company: str = "", tags: list[str] | None = None) -> bool:
    tags = tags or []

    text = normalize_text(title, company, " ".join(tags))

    has_include = any(k in text for k in INCLUDE_KEYWORDS)
    has_exclude = any(k in text for k in EXCLUDE_KEYWORDS)

    return has_include and not has_exclude

def normalize_job(item: dict[str, Any]) -> dict[str, str]:
    title = (item.get("position") or item.get("title") or "").strip()
    company = (item.get("company") or "").strip()
    link = (item.get("url") or f"https://remoteok.com/remote-jobs/{item.get('id', '')}").strip()

    return {
        "title": title,
        "company": company,
        "link": link,
        "source": "remoteok",
    }


def scrape_remoteok_jobs() -> list[dict[str, str]]:
    raw_jobs = fetch_jobs_raw()
    results: list[dict[str, str]] = []
    seen_links: set[str] = set()

    for item in raw_jobs:
        title = (item.get("position") or item.get("title") or "").strip()
        company = (item.get("company") or "").strip()
        tags = item.get("tags") or []

        if not isinstance(tags, list):
            tags = []

        job = normalize_job(item)
        link = job["link"]

        if not title or not company or not link:
            continue

        if link in seen_links:
            continue

        if not is_relevant_job(title, company, tags):
            continue

        seen_links.add(link)
        results.append(job)

    return results
