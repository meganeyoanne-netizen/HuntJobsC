import json
import re
import unicodedata

from django.db import transaction, IntegrityError
from django.db.models import F
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import Candidature


SKILL_ALIASES = {
    "js": "javascript",
    "reactjs": "react",
    "react js": "react",
    "nodejs": "node",
    "node js": "node",
    "vuejs": "vue",
    "vue js": "vue",
    "nextjs": "next",
    "next js": "next",
    "postgres": "postgresql",
    "power bi": "powerbi",
    "ms excel": "excel",
    "microsoft excel": "excel",
}

ROLE_ALIASES = {
    "developpeuse": "developpeur",
    "developer": "developpeur",
    "developpeur": "developpeur",
    "engineer": "ingenieur",
    "ingenieure": "ingenieur",
    "programmeur": "developpeur",
}

STOP_WORDS = {
    "a", "au", "aux", "avec", "de", "des", "du", "en", "et", "h", "la", "le",
    "les", "pour", "un", "une", "junior", "senior", "confirme", "femme", "homme",
}

EDUCATION_LEVELS = {
    "AUCUN": 0,
    "BEPC": 1,
    "PROBATOIRE": 2,
    "BAC": 3,
    "BAC+2": 5,
    "BAC+3": 6,
    "BAC+4": 7,
    "BAC+5": 8,
    "DOCTORAT": 11,
}


def _normalise(value):
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(character for character in text if not unicodedata.combining(character))
    return re.sub(r"[^a-z0-9+#.]+", " ", text.casefold()).strip()


def _json_text(value):
    try:
        return json.dumps(value or {}, ensure_ascii=False)
    except (TypeError, ValueError):
        return str(value or "")


def _canonical_skill(value):
    normalised = _normalise(value).replace(".js", " js")
    return SKILL_ALIASES.get(normalised, normalised)


def _unique_skills(values):
    result = {}
    for value in values or []:
        label = str(value).strip()
        canonical = _canonical_skill(label)
        if canonical:
            result.setdefault(canonical, label)
    return result


def _contains_phrase(corpus, phrase):
    if not phrase:
        return False
    return re.search(r"(?<![a-z0-9+#])" + re.escape(phrase) + r"(?![a-z0-9+#])", corpus) is not None


def _skill_in_corpus(corpus, canonical):
    variants = {canonical, *(alias for alias, target in SKILL_ALIASES.items() if target == canonical)}
    return any(_contains_phrase(corpus, variant) for variant in variants)


def _cv_text(cv):
    text = _json_text(cv.contenu_en_ligne)
    if not cv.fichier:
        return text
    try:
        from ia.extraction import extract_text

        with cv.fichier.open("rb") as uploaded:
            text += "\n" + extract_text(uploaded)
    except Exception:
        # Un fichier ancien, chiffré ou illisible ne doit pas bloquer la candidature.
        pass
    return text


def _title_tokens(value):
    tokens = []
    for token in _normalise(value).split():
        token = ROLE_ALIASES.get(token, token)
        if len(token) > 1 and token not in STOP_WORDS:
            tokens.append(token)
    return set(tokens)


def _education_level(text):
    normalised = _normalise(text)
    patterns = [
        (11, r"\b(doctorat|phd|bac\s*\+?\s*8)\b"),
        (8, r"\b(master|mba|ingenieur|bac\s*\+?\s*5)\b"),
        (7, r"\b(maitrise|bac\s*\+?\s*4)\b"),
        (6, r"\b(licence|bachelor|bac\s*\+?\s*3)\b"),
        (5, r"\b(bts|dut|deug|bac\s*\+?\s*2)\b"),
        (3, r"\b(baccalaureat|bac)\b"),
        (2, r"\bprobatoire\b"),
        (1, r"\b(bepc|brevet)\b"),
    ]
    return next((level for level, pattern in patterns if re.search(pattern, normalised)), 0)


def _speciality_tokens(value):
    generic = {
        "bac", "baccalaureat", "bachelor", "bepc", "brevet", "deug", "doctorat",
        "dut", "ingenieur", "licence", "maitrise", "master", "mba", "phd", "bts",
    }
    return _title_tokens(value) - generic


def compatibility_label(score):
    score = float(score or 0)
    if score >= 80:
        return "Très bonne compatibilité"
    if score >= 65:
        return "Bonne compatibilité"
    if score >= 45:
        return "Compatibilité modérée"
    return "Compatibilité limitée"


def score_candidate_offer(profile, offer, cv=None):
    cv_content = _cv_text(cv) if cv else ""
    profile_content = " ".join(
        [
            profile.titre_professionnel,
            profile.bio,
            _json_text(profile.competences),
            _json_text(profile.experiences),
            _json_text(profile.formations),
            _json_text(profile.langues),
            cv_content,
        ]
    )
    corpus = _normalise(profile_content)

    required = _unique_skills([*(offer.competences or []), *(offer.competences_validees or [])])
    candidate_skills = _unique_skills(profile.competences)
    matched = []
    missing = []
    for canonical, label in required.items():
        if canonical in candidate_skills or _skill_in_corpus(corpus, canonical):
            matched.append(label)
        else:
            missing.append(label)

    components = []
    if required:
        components.append({
            "key": "competences",
            "label": "Compétences requises",
            "raw_weight": 55,
            "ratio": len(matched) / len(required),
            "matched": matched,
            "missing": missing,
        })

    required_experience = int(offer.experience_requise or 0)
    candidate_experience = int(profile.annees_experience or 0)
    if required_experience > 0:
        components.append({
            "key": "experience",
            "label": "Expérience",
            "raw_weight": 25,
            "ratio": min(candidate_experience / required_experience, 1),
            "candidate_years": candidate_experience,
            "required_years": required_experience,
        })

    formation_text = _json_text(profile.formations) + " " + cv_content
    required_level = EDUCATION_LEVELS.get(offer.niveau_etudes, 0)
    if not required_level and offer.diplome_requis:
        required_level = _education_level(offer.diplome_requis)
    if required_level or (offer.diplome_requis or "").strip():
        candidate_level = _education_level(formation_text)
        level_ratio = min(candidate_level / required_level, 1) if required_level else 1
        diploma_tokens = _speciality_tokens(offer.diplome_requis)
        formation_tokens = _speciality_tokens(formation_text)
        speciality_ratio = (
            len(diploma_tokens & formation_tokens) / len(diploma_tokens)
            if diploma_tokens else 1
        )
        education_ratio = (0.7 * level_ratio) + (0.3 * speciality_ratio)
        components.append({
            "key": "formation",
            "label": "Formation",
            "raw_weight": 12,
            "ratio": education_ratio,
            "candidate_level": candidate_level,
            "required_level": required_level,
        })

    offer_title_tokens = _title_tokens(offer.titre)
    candidate_role_tokens = _title_tokens(profile.titre_professionnel + " " + profile_content)
    if offer_title_tokens:
        components.append({
            "key": "poste",
            "label": "Adéquation au poste",
            "raw_weight": 8,
            "ratio": len(offer_title_tokens & candidate_role_tokens) / len(offer_title_tokens),
        })

    total_weight = sum(component["raw_weight"] for component in components) or 1
    score = 0
    public_components = []
    for component in components:
        weight = component["raw_weight"] / total_weight
        component_score = round(component["ratio"] * 100, 2)
        score += weight * component_score
        public_components.append({
            **{key: value for key, value in component.items() if key not in {"raw_weight", "ratio"}},
            "weight": round(weight * 100, 2),
            "score": component_score,
        })

    score = round(max(0, min(score, 100)), 2)
    analysis = {
        "method": "rules-v2",
        "label": compatibility_label(score),
        "components": public_components,
        "competences_reconnues": matched,
        "competences_manquantes": missing,
        "description": (
            "Score calculé uniquement à partir des critères renseignés dans l'offre "
            "et des informations du profil et du CV sélectionné."
        ),
    }
    return score, analysis

def calculate_ats(application):
    profile = application.candidat.profil_candidat
    offer = application.offre
    score, analysis = score_candidate_offer(profile, offer, application.cv)
    application.calculer_score_ats(score, analysis)

@transaction.atomic
def submit_application(user, data):
    offer = data["offre"]
    cv = data["cv"]
    if cv.candidat.user_id != user.pk:
        raise ValidationError({"cv": "Ce CV ne vous appartient pas."})
    if not cv.fichier and not cv.contenu_en_ligne:
        raise ValidationError({"cv": "Ajoutez un fichier ou remplissez votre CV en ligne."})
    if offer.statut != "PUBLIEE" or offer.date_limite < timezone.localdate() or offer.entreprise.is_suspended or not offer.entreprise.is_active:
        raise ValidationError({"offre": "Cette offre n'accepte plus de candidatures."})
    try:
        with transaction.atomic():
            application = Candidature.objects.create(candidat=user, **data)
    except IntegrityError:
        raise ValidationError({"offre": "Vous avez déjà candidaté à cette offre."})
    calculate_ats(application)
    type(offer).objects.filter(pk=offer.pk).update(nombre_candidatures=F("nombre_candidatures") + 1)
    return application

@transaction.atomic
def update_application(application, data, candidate=False):
    if candidate:
        if set(data) - {"statut", "motif_retrait"} or data.get("statut") != "RETIREE":
            raise ValidationError("Vous pouvez uniquement retirer votre candidature.")
        if not application.est_active:
            raise ValidationError("Cette candidature est terminée.")
        application.retirer(data.get("motif_retrait", ""))
        return application
    if set(data) - {"statut", "note_interne", "motif_refus"}:
        raise ValidationError("Seuls le statut, la note interne et le motif de refus sont modifiables.")
    if "statut" in data:
        target = data["statut"]
        order = ["RECUE", "PRESELECTION", "ENTRETIEN", "EVALUATION", "RETENU"]
        if not application.est_active or target == "RETIREE" or target not in dict(Candidature.Status.choices):
            raise ValidationError("Changement de statut interdit.")
        if target != "REFUSE":
            current_index = order.index(application.statut)
            expected = order[current_index + 1] if current_index + 1 < len(order) else None
            if target != expected:
                raise ValidationError(
                    "Le recrutement doit avancer d'une seule étape à la fois. "
                    "Vous pouvez aussi refuser la candidature."
                )
        application.changer_statut(target, data.get("motif_refus", ""))
    if "note_interne" in data:
        if not isinstance(data["note_interne"], str) or len(data["note_interne"]) > 10000:
            raise ValidationError({"note_interne": "Note invalide ou trop longue."})
        application.note_interne = data["note_interne"]
        application.save(update_fields=["note_interne", "updated_at"])
    return application
