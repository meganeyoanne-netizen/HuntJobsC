import json
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.throttling import UserRateThrottle
from users.models import CV
from users.serializers import ProfilCandidatSerializer
from offres.models import Offre
from offres.serializers import OffreDetailSerializer
from plateforme.models import Entretien, GenerationIA
from .services import complete, IAUnavailable, PROMPTS

class IAThrottle(UserRateThrottle):
    rate = "20/hour"
    scope = "ia"

class IAView(APIView):
    throttle_classes = [IAThrottle]
    def post(self, request, outil):
        if outil not in PROMPTS:
            raise ValidationError("Outil inconnu.")
        from plateforme.platform_settings import get_platform_settings
        config = get_platform_settings()
        modules = {"analyse-offre": "aiOfferAnalysis", "simulation-entretien": "aiInterviewSimulation", "conseiller-cv": "aiCVAdvisor", "questions-entretien": "aiRecruiterQuestions"}
        if not config["aiEnabled"] or (outil in modules and not config[modules[outil]]):
            raise PermissionDenied("Ce module IA est désactivé par l’administrateur.")
        if outil == "questions-entretien":
            if not request.user.is_recruiter:
                raise PermissionDenied("Réservé aux recruteurs.")
            interview = get_object_or_404(Entretien.objects.select_related("candidature__candidat__profil_candidat", "candidature__offre__entreprise"), pk=request.data.get("entretien"), candidature__offre__recruteur=request.user)
            count = request.data.get("nombre", 5)
            if count not in [5, 10, 15, 20]:
                raise ValidationError({"nombre": "Choisissez 5, 10, 15 ou 20 questions."})
            context = {"nombre": count, "type": request.data.get("type", interview.type), "offre": OffreDetailSerializer(interview.candidature.offre).data, "profil": ProfilCandidatSerializer(interview.candidature.candidat.profil_candidat).data, "cv": interview.candidature.cv.contenu_en_ligne}
            raw = complete(outil, context)
            try:
                questions = json.loads(raw)["questions"]
                if len(questions) != count or not all(isinstance(q, dict) and isinstance(q.get("question"), str) and isinstance(q.get("keyPoints", []), list) and isinstance(q.get("evaluationCriteria", []), list) for q in questions):
                    raise ValueError()
            except (KeyError, ValueError, TypeError):
                raise IAUnavailable("La réponse IA ne respecte pas le format demandé.")
            interview.questions = questions
            interview.save(update_fields=["questions"])
            return Response({"questions": questions})
        if not request.user.is_candidate:
            raise PermissionDenied("Réservé aux candidats.")
        profile = request.user.profil_candidat
        context = {"profil": ProfilCandidatSerializer(profile).data, "nom": request.user.full_name, "email": request.user.email}
        cv_id = request.data.get("cv")
        cv = get_object_or_404(CV, pk=cv_id, candidat=profile) if cv_id else CV.objects.filter(candidat=profile).order_by("-is_primary").first()
        if cv:
            context["cv"] = cv.contenu_en_ligne
            if cv.fichier and cv.fichier.name.lower().endswith(".pdf"):
                from pypdf import PdfReader
                try:
                    with cv.fichier.open("rb") as file:
                        context["cv_text"] = " ".join(p.extract_text() or "" for p in PdfReader(file).pages)[:30000]
                except Exception:
                    raise ValidationError("Le PDF ne peut pas être lu. Utilisez un PDF contenant du texte.")
        offer_id = request.data.get("offre")
        if offer_id:
            offer = get_object_or_404(Offre, pk=offer_id, statut="PUBLIEE")
            context["offre"] = OffreDetailSerializer(offer).data
        context["texte"] = str(request.data.get("texte", ""))[:20000]
        if request.FILES.get("image"):
            from .extraction import image_data_url
            context["document_importe"] = complete("lire-image", {"instruction":"Transcrire le document"}, image=image_data_url(request.FILES["image"]))
        uploaded = request.FILES.get("fichier")
        if uploaded:
            from .extraction import extract_text
            context["document_importe"] = extract_text(uploaded)
        history = request.data.get("historique", [])
        if not isinstance(history, list) or len(history) > 30:
            raise ValidationError("Historique invalide.")
        context["historique"] = history
        document_tools = ("portfolio", "generer-cv", "lettre-motivation")
        if outil in document_tools:
            design = request.data.get("design", "libre")
            designs = {
                "cv-classique": "CV classique : en-tête centré, résumé, expériences chronologiques, formation et compétences. Style sobre et lisible.",
                "cv-moderne": "CV moderne : nom et titre marqués, colonne de synthèse pour les compétences et coordonnées, expériences structurées dans la colonne principale.",
                "cv-creatif": "CV créatif : présentation expressive avec accroche forte, compétences mises en avant et parcours clairement hiérarchisé.",
                "portfolio-minimal": "Portfolio minimal : introduction épurée, sélection de projets puis compétences et contact.",
                "portfolio-projets": "Portfolio projets : projets en vedette avec contexte, rôle, réalisations vérifiables et outils utilisés.",
                "portfolio-editorial": "Portfolio éditorial : présentation narrative du parcours, projets détaillés et démarche professionnelle.",
                "lettre-classique": "Lettre classique : présentation formelle, sobre, structurée et très lisible.",
                "lettre-moderne": "Lettre moderne : en-tête affirmé, paragraphes courts et hiérarchie visuelle contemporaine.",
                "lettre-elegante": "Lettre élégante : typographie raffinée, composition aérée et ton professionnel chaleureux.",
                "libre": "Modèle libre : choisis la structure la plus pertinente selon le profil et l'objectif du candidat.",
            }
            allowed_by_tool = {
                "generer-cv": ("cv-classique", "cv-moderne", "cv-creatif", "libre"),
                "portfolio": ("portfolio-minimal", "portfolio-projets", "portfolio-editorial", "libre"),
                "lettre-motivation": ("lettre-classique", "lettre-moderne", "lettre-elegante", "libre"),
            }
            allowed = allowed_by_tool[outil]
            if design not in allowed:
                raise ValidationError({"design": "Choisissez un modèle adapté au document."})
            context["design"] = designs[design]
            context["design_key"] = design
        if outil in ("portfolio", "generer-cv"):
            answers = request.data.get("reponses", [])
            if isinstance(answers, str):
                try:
                    answers = json.loads(answers)
                except ValueError:
                    raise ValidationError({"reponses": "Réponses invalides."})
            if not isinstance(answers, list) or len(answers) > 4 or any(
                not isinstance(item, dict) or not isinstance(item.get("question"), str)
                or not isinstance(item.get("reponse"), str)
                or len(item["question"]) > 500 or len(item["reponse"]) > 3000
                for item in answers
            ):
                raise ValidationError({"reponses": "Réponses invalides."})
            context["reponses"] = answers
            if request.data.get("etape") == "preparer":
                raw = complete("portfolio-questions", context)
                try:
                    questions = json.loads(raw)["questions"]
                    if not isinstance(questions, list) or len(questions) > 4 or any(
                        not isinstance(question, str) or not question.strip() or len(question) > 500
                        for question in questions
                    ):
                        raise ValueError()
                except (KeyError, ValueError, TypeError):
                    raise IAUnavailable("L'IA n'a pas pu préparer les questions. Réessayez.")
                return Response({"questions": questions})
        result = complete(outil, context)
        titles = {"generer-cv": "CV généré", "portfolio": "Portfolio généré", "lettre-motivation": "Lettre de motivation"}
        generation = GenerationIA.objects.create(
            user=request.user,
            outil=outil,
            titre=titles.get(outil, outil.replace("-", " ").capitalize()),
            contenu=result,
            design=request.data.get("design", "libre") if outil in document_tools else "libre",
            source_data=json.loads(json.dumps(context, ensure_ascii=False, default=str)),
        )
        if outil == "generer-cv":
            CV.objects.create(candidat=profile, titre="CV généré", contenu_en_ligne={"texte": result}, is_generated=True)
        from plateforme.serializers import GenerationSerializer
        return Response({"id": generation.pk, "resultat": result, "document": GenerationSerializer(generation).data})
