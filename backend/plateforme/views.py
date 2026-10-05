import json
import re
from pathlib import Path
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, serializers
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny
from users.models import User, Entreprise, CV, Document
from users.permissions import IsAdmin
from users.serializers import UserSerializer, EntrepriseSerializer, ProfilCandidatSerializer
from offres.models import Offre
from offres.serializers import OffreAdminSerializer, OffreListSerializer
from candidatures.models import Candidature
from candidatures.views import scoped_applications
from candidatures.serializers import CandidatureSerializer
from .models import Entretien, Notification, Alerte, Favori, Preference, Parametre, Message, GenerationIA
from .serializers import EntretienSerializer, NotificationSerializer, AlerteSerializer, MessageSerializer, GenerationSerializer
from .signals import notify, record_admin

def admin_user(user):
    return user.is_admin_role or user.is_superuser

class EntretienViewSet(viewsets.ModelViewSet):
    serializer_class = EntretienSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    def get_queryset(self):
        qs = Entretien.objects.select_related("candidature__candidat", "candidature__offre")
        user = self.request.user
        if admin_user(user):
            return qs
        if user.is_candidate:
            return qs.filter(candidature__candidat=user)
        return qs.filter(candidature__offre__recruteur=user)
    def check_recruiter(self):
        user = self.request.user
        if not user.is_recruiter or not user.profil_recruteur.entreprise.is_active or user.profil_recruteur.entreprise.is_suspended:
            raise PermissionDenied("Réservé aux recruteurs actifs.")
    @transaction.atomic
    def perform_create(self, serializer):
        self.check_recruiter()
        interview = serializer.save()
        if interview.candidature.statut == "PRESELECTION":
            interview.candidature.changer_statut("ENTRETIEN")
    def perform_update(self, serializer):
        self.check_recruiter()
        serializer.save()
    def perform_destroy(self, instance):
        self.check_recruiter()
        instance.statut = "ANNULE"
        instance.save(update_fields=["statut"])

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    http_method_names = ["get", "patch", "delete", "post", "head", "options"]
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    def create(self, request, *args, **kwargs):
        raise PermissionDenied("Les notifications sont créées par le système.")
    @action(detail=False, methods=["post"])
    def read_all(self, request):
        self.get_queryset().update(is_read=True)
        return Response({"detail": "Notifications marquées comme lues."})
    @action(detail=False, methods=["post"])
    def clear_read(self, request):
        self.get_queryset().filter(is_read=True).delete()
        return Response({"detail": "Notifications lues supprimées."})

class AlerteViewSet(viewsets.ModelViewSet):
    serializer_class = AlerteSerializer
    def get_queryset(self):
        return Alerte.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        if not self.request.user.is_candidate:
            raise PermissionDenied("Réservé aux candidats.")
        serializer.save(user=self.request.user)

class FavoriView(APIView):
    def get(self, request):
        if request.query_params.get("details") == "1":
            favorites = Favori.objects.filter(user=request.user, offre__statut="PUBLIEE").select_related("offre__entreprise").order_by("-id")
            offers = [favorite.offre for favorite in favorites]
            return Response(OffreListSerializer(offers, many=True).data)
        return Response(list(Favori.objects.filter(user=request.user).values_list("offre_id", flat=True)))
    def post(self, request):
        if not request.user.is_candidate:
            raise PermissionDenied("Réservé aux candidats.")
        offer = get_object_or_404(Offre, pk=request.data.get("offre"), statut="PUBLIEE")
        favorite, created = Favori.objects.get_or_create(user=request.user, offre=offer)
        if not created:
            favorite.delete()
        return Response({"favorite": created})

class PreferenceView(APIView):
    def get(self, request):
        obj, _ = Preference.objects.get_or_create(user=request.user)
        return Response(obj.data)
    def patch(self, request):
        if not isinstance(request.data, dict):
            raise ValidationError("Objet JSON requis.")
        obj, _ = Preference.objects.get_or_create(user=request.user)
        obj.data = {**obj.data, **request.data}
        obj.save()
        return Response(obj.data)

class PublicSettingsView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def get(self, request):
        from .platform_settings import DEFAULTS, get_platform_settings
        config = get_platform_settings()
        response = Response({key: config[key] for key in DEFAULTS})
        response["Cache-Control"] = "no-store"
        return response

class SettingsView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        from .platform_settings import get_platform_settings
        return Response(get_platform_settings())
    @transaction.atomic
    def patch(self, request):
        from .platform_settings import PlatformSettingsSerializer, get_platform_settings
        if not isinstance(request.data, dict):
            raise ValidationError("Objet JSON requis.")
        serializer = PlatformSettingsSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj, _ = Parametre.objects.select_for_update().get_or_create(key="general")
        # Preserve previously supported settings; validate the public/runtime fields.
        obj.data = {**obj.data, **request.data, **serializer.validated_data}
        obj.save(update_fields=["data"])
        return Response(get_platform_settings())

class AdminUsersView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request, pk=None):
        qs = User.objects.all()
        if pk:
            user = get_object_or_404(qs, pk=pk)
            data = UserSerializer(user).data
            from .models import JournalAdmin
            data["admin_history"] = list(JournalAdmin.objects.filter(cible_type="user",cible_id=pk).values("action","motif","created_at"))
            if user.is_candidate:
                data["profil"] = ProfilCandidatSerializer(user.profil_candidat).data
                data["entretiens"] = EntretienSerializer(Entretien.objects.filter(candidature__candidat=user), many=True, context={"request": request}).data
                data["documents"] = [{"id":cv.pk,"name":cv.titre,"type":"CV","date":cv.updated_at.isoformat(),"url":f"/api/fichiers/cv/{cv.pk}/"} for cv in CV.objects.filter(candidat__user=user)] + [{"id":doc.pk,"name":doc.titre,"type":doc.document_type,"date":doc.created_at.isoformat(),"url":f"/api/fichiers/document/{doc.pk}/"} for doc in Document.objects.filter(candidat__user=user)]
                data["candidatures"] = CandidatureSerializer(scoped_applications(user), many=True, context={"request": request}).data
            if user.is_recruiter:
                data["entreprise"] = EntrepriseSerializer(user.profil_recruteur.entreprise).data
            return Response(data)
        search = request.query_params.get("search", "")
        if search:
            qs = qs.filter(Q(email__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search))
        role = request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        return Response(UserSerializer(qs, many=True).data)
    def post(self,request,pk):
        user=get_object_or_404(User,pk=pk)
        if request.data.get("action")!="request-information":
            raise ValidationError("Action inconnue.")
        message=str(request.data.get("motif","")).strip()
        if not 10<=len(message)<=5000:
            raise ValidationError("Un message de 10 à 5000 caractères est requis.")
        record_admin(request.user,"user",pk,"request-information",message)
        notify(user.pk,"Informations demandées par l’administration",message,"notifications",None)
        return Response({"detail":"Demande envoyée dans les notifications."})
    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if user.pk == request.user.pk or user.is_superuser:
            raise ValidationError("Vous ne pouvez pas suspendre ce compte.")
        if set(request.data) - {"is_suspended", "suspension_reason"}:
            raise ValidationError("Champs non autorisés.")
        suspended = request.data.get("is_suspended")
        if not isinstance(suspended, bool):
            raise ValidationError({"is_suspended": "Valeur booléenne requise."})
        user.is_suspended = suspended
        user.suspension_reason = str(request.data.get("suspension_reason", ""))[:5000]
        user.suspension_date = timezone.now() if suspended else None
        user.save()
        record_admin(request.user,"user",pk,"suspend" if suspended else "reactivate",user.suspension_reason)
        return Response(UserSerializer(user).data)

class AdminCompanyView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request, pk=None):
        qs = Entreprise.objects.select_related("profil_recruteur__user")
        if pk:
            return Response(EntrepriseSerializer(get_object_or_404(qs, pk=pk)).data)
        return Response(EntrepriseSerializer(qs, many=True).data)
    @transaction.atomic
    def post(self, request, pk):
        company = get_object_or_404(Entreprise.objects.select_for_update(), pk=pk)
        operation = request.data.get("action")
        reason = str(request.data.get("motif", ""))[:5000]
        if operation == "verify":
            if company.verification_status != "PENDING":
                raise ValidationError("L'entreprise doit avoir soumis une demande de vérification.")
            company.verify()
        elif operation == "reject":
            company.reject_verification(reason)
        elif operation == "suspend":
            if company.is_suspended:
                raise ValidationError("Ce recruteur est déjà suspendu.")
            verification = company.verification_status
            company.suspend(reason)
            company.verification_status = verification
            company.save(update_fields=["verification_status"])
            user = company.profil_recruteur.user
            user.is_suspended = True
            user.suspension_reason = reason
            user.suspension_date = timezone.now()
            user.save(update_fields=["is_suspended", "suspension_reason", "suspension_date"])
        elif operation == "reactivate":
            if not company.is_suspended:
                raise ValidationError("Ce recruteur n'est pas suspendu.")
            company.reactivate()
            if company.verification_status == "SUSPENDED":
                company.verification_status = "VERIFIED" if company.verified_at else "REJECTED" if company.verification_comment else "PENDING" if company.verification_requested_at else "NOT_STARTED"
                company.save(update_fields=["verification_status"])
            user = company.profil_recruteur.user
            user.is_suspended = False
            user.suspension_reason = ""
            user.suspension_date = None
            user.save(update_fields=["is_suspended", "suspension_reason", "suspension_date"])
        elif operation == "unlock-email":
            company.allow_email_modification()
        elif operation == "unlock-nui":
            company.allow_nui_modification()
        elif operation == "request-information":
            notify(company.profil_recruteur.user_id, "Informations complémentaires demandées", reason, "recruiter-company", company.pk)
        else:
            raise ValidationError("Action inconnue.")
        record_admin(request.user,"company",pk,operation,reason)
        return Response(EntrepriseSerializer(company).data)

class AdminOfferAction(APIView):
    permission_classes = [IsAdmin]
    @transaction.atomic
    def post(self, request, pk):
        offer = get_object_or_404(Offre.objects.select_for_update(), pk=pk)
        operation = request.data.get("action")
        reason = str(request.data.get("motif", ""))[:5000]
        if operation == "suspend":
            if offer.statut not in ["BROUILLON", "EN_ATTENTE", "PUBLIEE"]:
                raise ValidationError("Cette offre ne peut pas être bloquée dans son état actuel.")
            offer.suspendre(reason)
        elif operation == "archive":
            offer.archiver()
        elif operation == "reactivate":
            if offer.statut != "SUSPENDUE":
                raise ValidationError("Seule une offre bloquée peut être réactivée.")
            if not offer.entreprise.is_active or offer.entreprise.is_suspended:
                raise ValidationError("Entreprise suspendue.")
            if offer.date_limite < timezone.localdate():
                raise ValidationError("La date limite est dépassée.")
            if offer.moderation_status == "APPROUVEE":
                offer.reactiver()
            else:
                offer.statut = "EN_ATTENTE" if offer.moderation_status == "EN_ATTENTE" else "BROUILLON"
            offer.motif_suspension = ""
            offer.save(update_fields=["statut", "motif_suspension", "updated_at"])
        else:
            raise ValidationError("Action inconnue.")
        record_admin(request.user,"offer",pk,operation,reason)
        return Response(OffreAdminSerializer(offer).data)

class CandidateDirectory(APIView):
    def get(self, request, pk=None):
        if not request.user.is_recruiter and not admin_user(request.user):
            raise PermissionDenied("Réservé aux recruteurs.")
        qs = User.objects.filter(role="CANDIDAT", is_active=True, is_suspended=False).select_related("profil_candidat")
        if not admin_user(request.user):
            applied_ids = scoped_applications(request.user).values_list("candidat_id", flat=True)
            qs = qs.filter(Q(profil_candidat__is_profile_public=True) | Q(pk__in=applied_ids))
        def serialize(user):
            profile = ProfilCandidatSerializer(user.profil_candidat).data
            return {"id": user.pk, "first_name": user.first_name, "last_name": user.last_name, "profil": profile,
                    "candidatures": CandidatureSerializer(scoped_applications(request.user).filter(candidat=user), many=True, context={"request": request}).data,
                    "cvs": list(CV.objects.filter(candidat__user=user, candidatures__in=scoped_applications(request.user)).distinct().values("id", "titre", "is_primary")) if scoped_applications(request.user).filter(candidat=user).exists() or admin_user(request.user) else []}
        if pk:
            return Response(serialize(get_object_or_404(qs, pk=pk)))
        return Response([serialize(u) for u in qs])

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    http_method_names = ["get", "post", "head", "options"]
    def get_queryset(self):
        return Message.objects.filter(candidature__in=scoped_applications(self.request.user))
    def perform_create(self, serializer):
        app = serializer.validated_data["candidature"]
        user = self.request.user
        if not scoped_applications(user).filter(pk=app.pk).exists():
            raise PermissionDenied("Cette candidature ne vous appartient pas.")
        content = serializer.validated_data["contenu"]
        if len(content) > 10000:
            raise ValidationError("Message trop long.")
        serializer.save(expediteur=user)
        recipient = app.offre.recruteur_id if user.is_candidate else app.candidat_id
        notify(recipient, "Nouveau message", content[:200], "candidate-applications" if recipient == app.candidat_id else "recruiter-applications", app.offre_id)

class GenerationViewSet(viewsets.ModelViewSet):
    http_method_names = ["get", "delete", "head", "options"]
    serializer_class = GenerationSerializer
    def get_queryset(self):
        return GenerationIA.objects.filter(user=self.request.user)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        generation = self.get_object()
        output_format = request.query_params.get("type", "pdf").lower()
        if generation.outil not in ("generer-cv", "portfolio", "lettre-motivation"):
            raise ValidationError("Ce résultat IA n'est pas un document exportable.")
        try:
            from .document_exports import export_generation
            content, content_type, extension = export_generation(generation, output_format)
        except ValueError:
            raise ValidationError({"format": "Choisissez pdf ou docx."})
        safe_title = "-".join(re.findall(r"[\wÀ-ÿ]+", generation.titre.lower())) or "document"
        response = FileResponse(content, as_attachment=request.query_params.get("inline") != "1", filename=safe_title + extension, content_type=content_type)
        response["X-Content-Type-Options"] = "nosniff"
        return response

class PrivateFileView(APIView):
    def get(self, request, kind, pk):
        if kind not in ["cv", "document", "immatriculation", "activite"]:
            raise ValidationError("Type de fichier inconnu.")
        if kind in ["cv", "document"]:
            model = CV if kind == "cv" else Document
            obj = get_object_or_404(model, pk=pk)
            owner = obj.candidat.user_id
            allowed = owner == request.user.pk or admin_user(request.user)
            if kind == "cv" and request.user.is_recruiter:
                allowed = allowed or Candidature.objects.filter(cv=obj, offre__recruteur=request.user).exists()
            if not allowed:
                raise PermissionDenied("Vous ne pouvez pas consulter ce fichier.")
            file = obj.fichier
            if kind == "cv" and not file and obj.contenu_en_ligne:
                from django.http import HttpResponse
                response = HttpResponse(json.dumps(obj.contenu_en_ligne, ensure_ascii=False, indent=2), content_type="text/plain; charset=utf-8")
                response["Content-Disposition"] = 'attachment; filename="cv.txt"'
                return response
        else:
            obj = get_object_or_404(Entreprise, pk=pk)
            if not admin_user(request.user) and obj.profil_recruteur.user_id != request.user.pk:
                raise PermissionDenied("Document privé.")
            file = obj.document_immatriculation if kind == "immatriculation" else obj.preuve_activite
        if not file:
            raise ValidationError("Aucun fichier disponible.")
        response = FileResponse(file.open("rb"), as_attachment=True, filename=Path(file.name).name)
        response["X-Content-Type-Options"] = "nosniff"
        return response

class PublicFileView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def get(self, request, path):
        normalized = Path(path).as_posix()
        if normalized.startswith(("entreprises/logos/", "avatars/", "offres/flyers/")) and ".." not in Path(path).parts:
            root = settings.MEDIA_ROOT.resolve()
            target = (root / path).resolve()
            if target.is_relative_to(root) and target.is_file():
                response = FileResponse(target.open("rb"))
                response["X-Content-Type-Options"] = "nosniff"
                return response
        from django.http import Http404
        raise Http404()

class AdminStatisticsView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        from .statistics import statistics
        response = DashboardView().get(request)
        response.data.update(statistics(request.user))
        return response

class DashboardView(APIView):
    def get(self, request):
        user = request.user
        apps = scoped_applications(user)
        if admin_user(user):
            jobs = Offre.objects.all()
            interviews = Entretien.objects.all()
        elif user.is_recruiter:
            jobs = Offre.objects.filter(recruteur=user)
            interviews = Entretien.objects.filter(candidature__offre__recruteur=user)
        else:
            jobs = Offre.objects.filter(statut="PUBLIEE", date_limite__gte=timezone.localdate(), entreprise__is_suspended=False, entreprise__is_active=True)
            interviews = Entretien.objects.filter(candidature__candidat=user)
        data = {"offres": jobs.count(), "offres_actives": jobs.filter(statut="PUBLIEE").count(), "candidatures": apps.count(), "entretiens": interviews.filter(statut="PLANIFIE").count(), "retenus": apps.filter(statut="RETENU").count(), "notifications": Notification.objects.filter(user=user, is_read=False).count()}
        if admin_user(user):
            data.update({"utilisateurs": User.objects.count(), "candidats": User.objects.filter(role="CANDIDAT").count(), "recruteurs": User.objects.filter(role="RECRUTEUR").count(), "entreprises_en_attente": Entreprise.objects.filter(verification_status="PENDING").count(), "offres_en_attente": jobs.filter(statut="EN_ATTENTE").count()})
        return Response(data)

class HealthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def get(self, request):
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return Response({"status": "ok", "database": connection.vendor, "ia_configured": bool(settings.GROQ_API_KEY)})
