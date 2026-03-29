from app.config.profile import PROFILE_KEYWORDS, PROFILE_WEIGHTS


def contains_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def get_keywords(key: str) -> list[str]:
    return PROFILE_KEYWORDS.get(key, [])


def get_weight(key: str, default: int = 0) -> int:
    return PROFILE_WEIGHTS.get(key, default)


def add_tag(tags: list[str], tag: str) -> None:
    if tag not in tags:
        tags.append(tag)


def classify_role(tags: list[str]) -> str:
    tag_set = set(tags)

    if "support" in tag_set:
        return "support"

    if "iam" in tag_set:
        return "iam"

    if "infrastructure" in tag_set or "systems" in tag_set or "network" in tag_set:
        return "infrastructure"

    if "cloud" in tag_set or "azure" in tag_set:
        return "cloud"

    if "security" in tag_set:
        return "security"

    return "other"


def detect_work_mode(location: str, work_mode: str) -> str:
    work_mode_text = (work_mode or "").strip().lower()
    location_text = f" {(location or '').lower()} "

    if work_mode_text in {"remote", "hybrid", "onsite"}:
        return work_mode_text

    if any(term in location_text for term in [
        " remoto ",
        " remote ",
        " work from home ",
        " desde casa ",
        " teletrabajo ",
    ]):
        return "remote"

    if any(term in location_text for term in [
        " híbrido ",
        " hibrido ",
        " hybrid ",
    ]):
        return "hybrid"

    if any(term in location_text for term in [
        " presencial ",
        " onsite ",
        " on-site ",
        " en oficina ",
    ]):
        return "onsite"

    return "unknown"


def is_barcelona_location(location: str) -> bool:
    text = f" {(location or '').lower()} "
    return any(term in text for term in [
        " barcelona ",
        " barcelona, spain ",
        " barcelona ciudad ",
        " sant cugat ",
        " catalunya ",
        " cataluña ",
        " catalonia ",
    ])


def is_spain_location(location: str) -> bool:
    text = f" {(location or '').lower()} "
    return any(term in text for term in [
        " spain ",
        " españa ",
        " espana ",
        " barcelona ",
        " madrid ",
        " valencia ",
        " sevilla ",
        " málaga ",
        " malaga ",
        " bilbao ",
        " zaragoza ",
        " murcia ",
        " alicante ",
        " catalunya ",
        " cataluña ",
        " catalonia ",
        " españa remoto ",
        " remote spain ",
    ])


def score_job(
    title: str,
    company: str,
    source: str = "",
    location: str = "",
    work_mode: str = "unknown",
) -> dict:
    title_text = f" {title} ".lower()
    source_text = f" {source} ".lower()
    location_text = f" {location} ".lower()
    full_text = f" {title} {company} {source} {location} ".lower()

    score = 0
    tags: list[str] = []

    positive_keys = [
        "support",
        "iam",
        "azure",
        "cloud",
        "infrastructure",
        "systems",
        "windows",
        "microsoft",
        "network",
        "security",
        "linux",
        "it",
    ]

    for key in positive_keys:
        keywords = get_keywords(key)
        weight = get_weight(key)

        if not keywords or weight == 0:
            continue

        title_match = contains_any(title_text, keywords)
        full_match = contains_any(full_text, keywords)

        if title_match:
            score += weight + 2
            add_tag(tags, key)
        elif full_match:
            score += weight
            add_tag(tags, key)

    devops_keywords = get_keywords("devops")
    devops_weight = get_weight("devops")

    if devops_keywords and contains_any(title_text, devops_keywords):
        score += max(devops_weight - 2, 0)
        add_tag(tags, "devops")
    elif devops_keywords and contains_any(full_text, devops_keywords):
        score += max(devops_weight - 3, 0)
        add_tag(tags, "devops")

    strong_support_phrases = [
        "technical support",
        "tech support",
        "customer support",
        "service desk",
        "help desk",
        "helpdesk",
        "desktop support",
        "it support",
        "support engineer",
        "support specialist",
        "field support",
        "it technician",
        "technical specialist",
        "technical services",
        "soporte técnico",
        "soporte tecnico",
        "mesa de ayuda",
        "mesa de servicio",
        "atención técnica",
        "atencion tecnica",
        "servicio técnico",
        "servicio tecnico",
        "analista de soporte",
        "técnico de soporte",
        "tecnico de soporte",
        "especialista de soporte",
        "n1",
        "n2",
        "n3",
        "nivel 1",
        "nivel 2",
        "nivel 3",
        "l1",
        "l2",
        "l3",
        "2nd line",
        "3rd line",
        "second line support",
        "desktop technician",
    ]

    strong_infra_phrases = [
        "system administrator",
        "systems administrator",
        "sysadmin",
        "infrastructure",
        "network administrator",
        "windows server",
        "active directory",
        "microsoft 365",
        "office 365",
        "exchange",
        "intune",
        "citrix",
        "vmware",
        "administrador de sistemas",
        "administración de sistemas",
        "administracion de sistemas",
        "infraestructura",
        "redes",
        "soporte de sistemas",
        "network support",
        "infra support",
    ]

    strong_iam_phrases = [
        "iam",
        "identity",
        "entra",
        "azure ad",
        "active directory",
        "gestión de identidades",
        "gestion de identidades",
        "identity access",
    ]

    strong_security_phrases = [
        "security analyst",
        "cybersecurity",
        "ciberseguridad",
        "soc",
        "incident response",
        "vulnerability",
        "security operations",
        "analista de seguridad",
    ]

    if contains_any(title_text, strong_support_phrases):
        score += 6
        add_tag(tags, "support")

    if contains_any(title_text, strong_infra_phrases):
        score += 4
        add_tag(tags, "infrastructure")

    if contains_any(title_text, strong_iam_phrases):
        score += 3
        add_tag(tags, "iam")

    if contains_any(title_text, strong_security_phrases):
        score += 2
        add_tag(tags, "security")

    if "tecnoempleo" in source_text:
        score += 1

    if "remoteok" in source_text or "remotive" in source_text or "wwr" in source_text:
        score += 1

    penalty_keys = [
        "senior_penalty",
        "engineer_penalty",
        "developer_penalty",
        "sales_penalty",
        "marketing_penalty",
        "design_penalty",
        "writer_penalty",
    ]

    for key in penalty_keys:
        keywords = get_keywords(key)
        weight = get_weight(key)

        if keywords and contains_any(full_text, keywords):
            score += weight

    hard_negative_phrases = [
        "frontend",
        "front end",
        "backend",
        "fullstack",
        "full-stack",
        "software engineer",
        "developer",
        "product manager",
        "designer",
        "marketing",
        "seo",
        "sales",
        "writer",
        "content",
    ]

    strong_seniority_phrases = [
        "senior",
        "lead",
        "principal",
        "head of",
        "director",
        "manager",
    ]

    if contains_any(title_text, hard_negative_phrases):
        score -= 6

    if contains_any(title_text, strong_seniority_phrases):
        score -= 4

    generic_customer_service_phrases = [
        "customer service representative",
        "bilingual customer service",
        "call center",
        "atención al cliente",
        "atencion al cliente",
        "teleoperador",
    ]

    if contains_any(title_text, generic_customer_service_phrases):
        score -= 2

    weak_analyst_phrases = [
        "compensation analyst",
        "financial crimes analyst",
        "crypto analyst",
        "trader",
    ]

    if contains_any(title_text, weak_analyst_phrases):
        score -= 3

    weak_support_phrases = [
        "quality assurance",
        "qa",
        "customer support- quality assurance",
        "customer support - quality assurance",
    ]

    if contains_any(title_text, weak_support_phrases):
        score -= 5

    if "head of support" in title_text:
        score += 3

    disqualifying_role_phrases = [
        "product manager",
        "designer",
        "marketing",
        "seo",
        "sales",
        "writer",
        "content",
        "frontend",
        "front end",
        "backend",
        "fullstack",
        "full-stack",
        "developer",
        "software engineer",
    ]

    if contains_any(title_text, disqualifying_role_phrases):
        tags = [
            tag for tag in tags
            if tag not in {"infrastructure", "cloud", "iam", "security", "devops"}
        ]

    detected_work_mode = detect_work_mode(location, work_mode)

    if detected_work_mode == "onsite":
        add_tag(tags, "onsite")
    elif detected_work_mode == "hybrid":
        add_tag(tags, "hybrid")
    elif detected_work_mode == "remote":
        add_tag(tags, "remote")

    if is_barcelona_location(location):
        score += 8
        add_tag(tags, "barcelona")
    elif is_spain_location(location):
        score += 4
        add_tag(tags, "spain")

    if is_barcelona_location(location) and detected_work_mode == "onsite":
        score += 8
    elif is_barcelona_location(location) and detected_work_mode == "hybrid":
        score += 7
    elif is_barcelona_location(location) and detected_work_mode == "remote":
        score += 5
    elif is_barcelona_location(location):
        score += 3

    if is_spain_location(location) and detected_work_mode == "remote":
        score += 4
    elif is_spain_location(location) and detected_work_mode == "hybrid":
        score += 2
    elif is_spain_location(location) and detected_work_mode == "onsite":
        score += 1

    if detected_work_mode == "onsite" and not is_barcelona_location(location) and not is_spain_location(location):
        score -= 3

    if detected_work_mode == "hybrid" and not is_barcelona_location(location) and not is_spain_location(location):
        score -= 2

    if detected_work_mode == "remote" and not is_barcelona_location(location) and not is_spain_location(location):
        score += 1

    if not location_text.strip():
        score -= 1

    unique_tags = sorted(set(tags))
    role_class = classify_role(unique_tags)

    return {
        "score": score,
        "tags": ",".join(unique_tags),
        "role_class": role_class,
    }
