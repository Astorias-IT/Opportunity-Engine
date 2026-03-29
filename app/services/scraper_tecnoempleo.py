import requests
from bs4 import BeautifulSoup


BASE_URL = "https://www.tecnoempleo.com"
SEARCH_URL = "https://www.tecnoempleo.com/ofertas-trabajo/"
MAX_PAGES = 20

STRONG_NEGATIVE_KEYWORDS = [
    "tech lead",
    "architect",
    "arquitecto",
    "frontend",
    "backend",
    "fullstack",
    "full-stack",
    "product manager",
    "designer",
    "seo",
    "marketing",
    "sales",
]

SUPPORT_INFRA_POSITIVE_TERMS = [
    "support",
    "technical support",
    "tech support",
    "help desk",
    "helpdesk",
    "service desk",
    "desktop support",
    "it support",
    "support engineer",
    "support specialist",
    "field support",
    "it technician",
    "systems administrator",
    "system administrator",
    "sysadmin",
    "administrador de sistemas",
    "administración de sistemas",
    "administracion de sistemas",
    "soporte",
    "soporte técnico",
    "soporte tecnico",
    "mesa de ayuda",
    "mesa de servicio",
    "servicio técnico",
    "servicio tecnico",
    "técnico de soporte",
    "tecnico de soporte",
    "analista de soporte",
    "técnico de campo",
    "tecnico de campo",
    "microinformática",
    "microinformatica",
    "field technician",
    "n1",
    "n2",
    "n3",
    "nivel 1",
    "nivel 2",
    "nivel 3",
    "l1",
    "l2",
    "l3",
    "systems",
    "infraestructura",
    "redes",
    "network",
    "network administrator",
    "network support",
    "microsoft 365",
    "office 365",
    "windows",
    "active directory",
    "intune",
    "citrix",
    "vmware",
    "servicenow",
    "linux",
    "it",
    "informatica",
    "informática",
    "técnico hardware",
    "tecnico hardware",
]

NEGATIVE_TERMS = [
    "frontend",
    "backend",
    "fullstack",
    "full-stack",
    "product manager",
    "designer",
    "seo",
    "marketing",
    "sales",
    "architect",
    "arquitecto",
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


def _page_url(page: int) -> str:
    if page <= 1:
        return SEARCH_URL
    return f"{SEARCH_URL}?pagina={page}"


def _infer_work_mode(location: str, description: str, title: str, full_card_text: str) -> str:
    text = f" {(location or '')} {(description or '')} {(title or '')} {(full_card_text or '')} ".lower()

    if any(term in text for term in [
        "híbrido",
        "hibrido",
        "hybrid",
    ]):
        return "hybrid"

    if any(term in text for term in [
        "presencial",
        "onsite",
        "on-site",
        "en oficina",
        "in-office",
        "on site",
    ]):
        return "onsite"

    if any(term in text for term in [
        "100% remoto",
        "remoto",
        "remote",
        "teletrabajo",
        "en remoto",
    ]):
        return "remote"

    return "unknown"


def _infer_location(text_blocks: list[str]) -> str:
    location_priority = [
        "barcelona",
        "madrid",
        "valencia",
        "sevilla",
        "málaga",
        "malaga",
        "zaragoza",
        "bilbao",
        "alicante",
        "murcia",
        "españa",
        "espana",
        "catalunya",
        "cataluña",
        "spain",
        "remote",
        "remoto",
        "100% remoto",
        "híbrido",
        "hibrido",
        "presencial",
        "onsite",
        "on-site",
        "en oficina",
    ]

    for text in text_blocks:
        lowered = text.lower()
        if any(term in lowered for term in location_priority):
            return _clean_text(text)

    return ""


def _contains_positive_terms(text: str) -> bool:
    lowered = (text or "").lower()
    return any(term in lowered for term in SUPPORT_INFRA_POSITIVE_TERMS)


def _contains_negative_terms(text: str) -> bool:
    lowered = (text or "").lower()
    if any(term in lowered for term in STRONG_NEGATIVE_KEYWORDS):
        return True
    return any(term in lowered for term in NEGATIVE_TERMS)


def _is_support_or_infra(title: str, description: str = "", category: str = "", full_card_text: str = "") -> bool:
    if not title:
        return False

    text = " ".join([
        _clean_text(title),
        _clean_text(description),
        _clean_text(category),
        _clean_text(full_card_text),
    ]).lower()

    if _contains_negative_terms(title):
        return False

    if _contains_negative_terms(text) and not _contains_positive_terms(text):
        return False

    if _contains_positive_terms(title):
        return True

    if _contains_positive_terms(category):
        return True

    if _contains_positive_terms(description):
        return True

    if _contains_positive_terms(full_card_text):
        return True

    return False


def _extract_company(card, title: str) -> str:
    for a in card.find_all("a", href=True):
        text = _clean_text(a.get_text(" ", strip=True))
        href = a.get("href", "")

        if not text:
            continue

        if text == title:
            continue

        if "/empresa-" in href or "/consultora-" in href:
            return text

    for a in card.find_all("a", href=True):
        text = _clean_text(a.get_text(" ", strip=True))
        if text and text != title:
            return text

    return "Unknown company"


def _extract_description(card, title: str, company: str) -> str:
    candidates = []

    for node in card.find_all(["p", "div"]):
        text = _clean_text(node.get_text(" ", strip=True))
        if not text:
            continue
        if text == title or text == company:
            continue
        if len(text) >= 40:
            candidates.append(text)

    if candidates:
        return candidates[0]

    return ""


def _extract_category(text_blocks: list[str]) -> str:
    category_terms = [
        "soporte técnico",
        "helpdesk",
        "técnico de sistemas",
        "administrador",
        "redes",
        "ciberseguridad",
        "devops",
        "analista",
        "técnico hardware",
        "técnico software",
        "operador",
    ]

    for text in text_blocks:
        lowered = text.lower()
        if any(term in lowered for term in category_terms):
            return _clean_text(text)

    return ""


def _parse_listing_page(html: str, seen_links: set[str]) -> list[dict]:
    jobs = []
    soup = BeautifulSoup(html, "html.parser")
    title_links = soup.select("h3 a")

    for title_link in title_links:
        try:
            title = _clean_text(title_link.get_text(" ", strip=True))
            link = _absolute_url(title_link.get("href", ""))

            if not title or not link or link in seen_links:
                continue

            card = (
                title_link.find_parent("article")
                or title_link.find_parent("div")
                or title_link.parent
            )

            if not card:
                continue

            full_card_text = _clean_text(card.get_text(" ", strip=True))
            text_blocks = [
                _clean_text(node.get_text(" ", strip=True))
                for node in card.find_all(["span", "div", "p", "li"])
            ]
            text_blocks = [text for text in text_blocks if text]

            company = _extract_company(card, title)
            description = _extract_description(card, title, company)
            location = _infer_location(text_blocks)
            category = _extract_category(text_blocks)

            if not _is_support_or_infra(
                title=title,
                description=description,
                category=category,
                full_card_text=full_card_text,
            ):
                continue

            seen_links.add(link)

            jobs.append(
                {
                    "title": title,
                    "company": company.strip() or "Unknown company",
                    "link": link,
                    "source": "tecnoempleo",
                    "location": location.strip(),
                    "work_mode": _infer_work_mode(location, description, title, full_card_text),
                    "description": description.strip(),
                }
            )

        except Exception:
            continue

    return jobs


def scrape_tecnoempleo():
    jobs = []
    seen_links: set[str] = set()

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
        )
    }

    session = requests.Session()
    session.headers.update(headers)

    for page in range(1, MAX_PAGES + 1):
        url = _page_url(page)

        try:
            response = session.get(url, timeout=20)
            response.raise_for_status()

            if not response.encoding or response.encoding.lower() == "iso-8859-1":
                response.encoding = response.apparent_encoding or "utf-8"

            page_jobs = _parse_listing_page(response.text, seen_links)

            if not page_jobs and page > 3:
                break

            jobs.extend(page_jobs)

        except Exception as e:
            print(f"[tecnoempleo] request/parse error page {page}: {e}")
            if page == 1:
                return jobs
            continue

    return jobs
