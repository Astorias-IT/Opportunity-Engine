import requests
from bs4 import BeautifulSoup


BASE_URL = "https://weworkremotely.com"
SEARCH_URL = "https://weworkremotely.com/remote-jobs"

STRONG_NEGATIVE_KEYWORDS = [
    "writer",
    "editor",
    "content",
    "seo",
    "marketing",
    "advertising",
    "sales",
    "designer",
    "brand",
    "transcription",
    "course creator",
    "product manager",
    "product operations",
    "operations manager",
    "operations lead",
    "analytics",
    "data",
    "devops",
    "sre",
    "frontend",
    "front end",
    "backend",
    "fullstack",
    "full-stack",
    "developer",
    "software engineer",
    "machine learning",
    "director",
]


def _absolute_url(href: str) -> str:
    if not href:
        return ""

    href = href.strip()

    if href.startswith("http://") or href.startswith("https://"):
        return href

    if href.startswith("/"):
        return f"{BASE_URL}{href}"

    return f"{BASE_URL}/{href}"


def _clean_text(value: str) -> str:
    if not value:
        return ""
    return " ".join(value.split()).strip()


def _is_job_href(href: str) -> bool:
    if not href:
        return False

    href = href.strip().lower()

    if "/remote-jobs/" not in href:
        return False

    if href.endswith("#job-listings"):
        return False

    if "view-company-profile" in href:
        return False

    return True


def _should_skip_title(title: str) -> bool:
    if not title:
        return True

    lowered = title.lower().strip()
    return any(keyword in lowered for keyword in STRONG_NEGATIVE_KEYWORDS)


def _parse_job_text(text: str):
    text = _clean_text(text)
    if not text:
        return "", "", ""

    tokens = text.split()

    while tokens and tokens[0].lower() in {"new", "featured", "top", "pro"}:
        tokens.pop(0)

    cleaned = " ".join(tokens)
    parts = cleaned.split()

    marker_index = None
    for i, token in enumerate(parts):
        tl = token.lower()
        if (
            (tl.endswith("d") and tl[:-1].isdigit())
            or (tl.endswith("h") and tl[:-1].isdigit())
            or (tl.endswith("m") and tl[:-1].isdigit())
        ):
            marker_index = i
            break

    if marker_index is None:
        return cleaned, "", ""

    title = " ".join(parts[:marker_index]).strip()
    remainder = parts[marker_index + 1 :]

    stop_words = {
        "full-time",
        "contract",
        "featured",
        "top",
        "pro",
        "anywhere",
        "united",
        "states",
        "usa",
        "canada",
        "remote",
        "worldwide",
        "$25,000",
        "$50,000",
        "$75,000",
        "$100,000",
    }

    company_tokens = []
    location_tokens = []
    hit_stop = False

    for token in remainder:
        tl = token.lower()
        if not hit_stop and tl not in stop_words:
            company_tokens.append(token)
            continue

        hit_stop = True
        location_tokens.append(token)

    company = " ".join(company_tokens).strip()
    location = " ".join(location_tokens).strip()

    if company:
        words = company.split()
        half = len(words) // 2
        if half > 1 and words[:half] == words[half:]:
            company = " ".join(words[:half])

    return title, company, location


def scrape_wwr():
    jobs = []

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
        )
    }

    try:
        response = requests.get(SEARCH_URL, headers=headers, timeout=15)
        response.raise_for_status()

        if not response.encoding:
            response.encoding = response.apparent_encoding or "utf-8"

    except Exception as e:
        print(f"[wwr] request error: {e}")
        return jobs

    try:
        soup = BeautifulSoup(response.text, "html.parser")
        seen_links = set()

        for a in soup.find_all("a", href=True):
            try:
                href = a.get("href", "")
                if not _is_job_href(href):
                    continue

                link = _absolute_url(href)
                if link in seen_links:
                    continue

                text = _clean_text(a.get_text(" ", strip=True))
                if not text:
                    continue

                title, company, location = _parse_job_text(text)

                if not title:
                    continue

                if _should_skip_title(title):
                    continue

                seen_links.add(link)

                jobs.append(
                    {
                        "title": title,
                        "company": company.strip() or "Unknown company",
                        "link": link.strip(),
                        "source": "wwr",
                        "location": location.strip() or "Remote",
                        "work_mode": "remote",
                        "description": "",
                    }
                )

            except Exception:
                continue

    except Exception as e:
        print(f"[wwr] parse error: {e}")

    return jobs
