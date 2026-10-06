from django.db import transaction
from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Offre
from .permissions import (
    CanCreateOffer,
    CanManageOffer,
    CanModerateOffer,
    CanViewOffer,
)
from .serializers import (
    OffreAdminSerializer,
    OffreCreateSerializer,
    OffreDetailSerializer,
    OffreListSerializer,
    OffreStatusSerializer,
    OffreUpdateSerializer,
)


# ============================================================
# UTILITAIRES
# ============================================================

def get_user_company(user):
    """
    Récupère l'entreprise associée au recruteur connecté.
    Si elle n'existe pas encore, la crée automatiquement.
    """
    try:
        from users.models import ProfilRecruteur, Entreprise
        profil, _ = ProfilRecruteur.objects.get_or_create(user=user)
        try:
            return profil.entreprise
        except Entreprise.DoesNotExist:
            company_name = user.get_full_name() or (f"Entreprise {user.first_name}".strip() if user.first_name else "") or "Mon Entreprise"
            entreprise = Entreprise.objects.create(
                profil_recruteur=profil,
                nom=company_name,
            )
            return entreprise
    except Exception:
        return None

def update_expired_offers(queryset):
    """
    Met automatiquement à jour les offres publiées dont
    la date limite est dépassée.
    """

    today = timezone.localdate()

    queryset.filter(
        statut=Offre.Status.PUBLIEE,
        date_limite__lt=today,
    ).update(
        statut=Offre.Status.EXPIREE,
        date_expiration=timezone.now(),
    )


# ============================================================
# LISTE PUBLIQUE DES OFFRES
# ============================================================

class OffreListView(generics.ListAPIView):
    """
    Liste des offres publiées.

    Accessible sans authentification afin que les visiteurs
    puissent consulter les opportunités disponibles.
    """

    serializer_class = OffreListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):

        queryset = Offre.objects.select_related(
            "entreprise",
            "recruteur",
        ).filter(
            statut=Offre.Status.PUBLIEE,
            date_limite__gte=timezone.localdate(),
            entreprise__is_active=True,
            entreprise__is_suspended=False,
        )

        # Recherche
        search = self.request.query_params.get(
            "search",
            ""
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(titre__icontains=search)
                | Q(description__icontains=search)
                | Q(localisation__icontains=search)
                | Q(competences__icontains=search)
                | Q(entreprise__nom__icontains=search)
            )

        # Type de contrat
        type_contrat = self.request.query_params.get(
            "type_contrat"
        )

        if type_contrat:
            queryset = queryset.filter(
                type_contrat=type_contrat
            )

        # Localisation
        localisation = self.request.query_params.get(
            "localisation"
        )

        if localisation:
            queryset = queryset.filter(
                localisation__icontains=localisation
            )

        # Mode de travail
        mode_travail = self.request.query_params.get(
            "mode_travail"
        )

        if mode_travail:
            queryset = queryset.filter(
                mode_travail=mode_travail
            )

        # Niveau d'expérience
        niveau_experience = self.request.query_params.get(
            "niveau_experience"
        )

        if niveau_experience:
            queryset = queryset.filter(
                niveau_experience=niveau_experience
            )

        # Niveau d'études
        niveau_etudes = self.request.query_params.get(
            "niveau_etudes"
        )

        if niveau_etudes:
            queryset = queryset.filter(
                niveau_etudes=niveau_etudes
            )

        # Offre d'entreprise vérifiée uniquement
        entreprise_verifiee = self.request.query_params.get(
            "entreprise_verifiee"
        )

        if entreprise_verifiee == "true":
            queryset = queryset.filter(
                entreprise__verification_status="VERIFIED"
            )

        return queryset.order_by(
            "-date_publication",
            "-created_at",
        )


# ============================================================
# DÉTAIL D'UNE OFFRE
# ============================================================

class OffreDetailView(generics.RetrieveAPIView):
    """
    Affiche le détail d'une offre.

    Une offre publiée est accessible à tous.
    Un recruteur peut consulter ses propres offres,
    même si elles ne sont pas encore publiées.
    """

    serializer_class = OffreDetailSerializer
    permission_classes = [CanViewOffer]

    queryset = Offre.objects.select_related(
        "entreprise",
        "recruteur",
    )

    lookup_field = "pk"

    def retrieve(self, request, *args, **kwargs):

        instance = self.get_object()

        # Les vues ne sont comptabilisées que pour les visiteurs
        # qui consultent une offre publiée.
        if (
            instance.statut == Offre.Status.PUBLIEE
            and (
                not request.user.is_authenticated
                or instance.recruteur_id != request.user.id
            )
        ):
            Offre.objects.filter(
                pk=instance.pk
            ).update(
                nombre_vues=F("nombre_vues") + 1
            )

            instance.nombre_vues += 1

        serializer = self.get_serializer(instance)

        return Response(serializer.data)


# ============================================================
# CRÉATION D'UNE OFFRE
# ============================================================

class OffreCreateView(generics.CreateAPIView):
    """
    Création d'une offre par un recruteur.

    Une entreprise n'a pas besoin d'être vérifiée pour
    créer une offre.
    """

    serializer_class = OffreCreateSerializer
    permission_classes = [
        IsAuthenticated,
        CanCreateOffer,
    ]

    parser_classes = [
        JSONParser,
        MultiPartParser,
        FormParser,
    ]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        user = request.user
        entreprise = get_user_company(user)

        if entreprise is None:
            return Response(
                {
                    "detail": (
                        "Aucune entreprise n'est associée "
                        "à votre profil recruteur."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        offre = serializer.save(
            recruteur=user,
            entreprise=entreprise,
            statut=Offre.Status.BROUILLON,
            moderation_status=(
                Offre.ModerationStatus.NON_SOUMISE
            ),
        )

        return Response(
            OffreDetailSerializer(
                offre,
                context={"request": request},
            ).data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# OFFRES DU RECRUTEUR CONNECTÉ
# ============================================================

class MyOffersView(generics.ListAPIView):
    """
    Liste des offres appartenant au recruteur connecté.
    """

    serializer_class = OffreListSerializer
    permission_classes = [
        IsAuthenticated,
        CanCreateOffer,
    ]

    def get_queryset(self):

        update_expired_offers(
            Offre.objects.filter(
                recruteur=self.request.user
            )
        )

        return Offre.objects.select_related(
            "entreprise",
            "recruteur",
        ).filter(
            recruteur=self.request.user
        ).order_by(
            "-created_at"
        )


# ============================================================
# MODIFICATION D'UNE OFFRE
# ============================================================

class OffreUpdateView(generics.UpdateAPIView):
    """
    Modification d'une offre par son propriétaire.

    Les compétences validées et le diplôme requis déjà
    enregistrés sont protégés par OffreUpdateSerializer.
    """

    serializer_class = OffreUpdateSerializer
    permission_classes = [
        IsAuthenticated,
        CanManageOffer,
    ]

    parser_classes = [
        JSONParser,
        MultiPartParser,
        FormParser,
    ]

    queryset = Offre.objects.select_related(
        "entreprise",
        "recruteur",
    )

    lookup_field = "pk"

    def perform_update(self, serializer):

        offre = self.get_object()

        # Une modification d'une offre rejetée doit permettre
        # au recruteur de la corriger puis de la resoumettre.
        if (
            offre.statut == Offre.Status.REJETEE
        ):
            offre = serializer.save(
                statut=Offre.Status.BROUILLON,
                moderation_status=(
                    Offre.ModerationStatus.NON_SOUMISE
                ),
                motif_rejet="",
            )

        else:
            serializer.save()


# ============================================================
# SUPPRESSION D'UNE OFFRE
# ============================================================

class OffreDeleteView(generics.DestroyAPIView):
    """
    Suppression d'une offre par son propriétaire.

    Une offre publiée peut être archivée plutôt que supprimée
    depuis le frontend.
    """

    permission_classes = [
        IsAuthenticated,
        CanManageOffer,
    ]

    queryset = Offre.objects.all()

    lookup_field = "pk"


# ============================================================
# SOUMISSION À LA MODÉRATION
# ============================================================

class OffreSubmitModerationView(APIView):
    """
    Le recruteur soumet son offre à l'administrateur.
    """

    permission_classes = [
        IsAuthenticated,
        CanManageOffer,
    ]

    def post(self, request, pk):

        offre = get_object_or_404(
            Offre,
            pk=pk,
        )

        self.check_object_permissions(
            request,
            offre,
        )

        if offre.statut == Offre.Status.PUBLIEE:
            return Response(
                {
                    "detail": (
                        "Cette offre est déjà publiée."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if offre.statut == Offre.Status.SUSPENDUE:
            return Response(
                {
                    "detail": (
                        "Une offre suspendue ne peut pas "
                        "être soumise à la modération."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if offre.date_limite < timezone.localdate():
            return Response(
                {
                    "detail": (
                        "La date limite de candidature "
                        "est dépassée."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not offre.diplome_requis or not offre.diplome_requis.strip():
            offre.diplome_requis = "Selon profil"
            offre.save(update_fields=["diplome_requis"])

        if not offre.competences:
            return Response(
                {"detail": "Veuillez renseigner au moins une compétence requise avant soumission."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        offre.soumettre_moderation()

        return Response(
            {
                "detail": (
                    "L'offre a été soumise à la modération."
                ),
                "statut": offre.statut,
                "moderation_status": (
                    offre.moderation_status
                ),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# ACTIONS ADMINISTRATEUR
# ============================================================

class OffreModerationView(APIView):
    """
    Modération d'une offre par l'administrateur.

    Actions :
    - publier
    - rejeter
    - suspendre
    """

    permission_classes = [
        IsAuthenticated,
        CanModerateOffer,
    ]

    def post(self, request, pk):

        offre = get_object_or_404(
            Offre,
            pk=pk,
        )

        serializer = OffreStatusSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        action = serializer.validated_data["action"]
        motif = serializer.validated_data.get(
            "motif",
            ""
        ).strip()

        if action == "publier":

            if (
                offre.moderation_status
                != Offre.ModerationStatus.APPROUVEE
            ):
                return Response(
                    {
                        "detail": (
                            "L'offre doit être approuvée "
                            "avant sa publication."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            offre.publier()

            message = "L'offre a été publiée."

        elif action == "rejeter":

            offre.rejeter(motif)

            message = "L'offre a été rejetée."

        elif action == "suspendre":

            offre.suspendre(motif)

            message = "L'offre a été suspendue."

        else:
            return Response(
                {
                    "detail": (
                        "Action non autorisée pour la modération."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "detail": message,
                "offre": OffreAdminSerializer(
                    offre,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# APPROBATION ADMIN
# ============================================================

class OffreApproveView(APIView):
    """
    L'administrateur approuve une offre.
    L'approbation ne signifie pas nécessairement que
    l'offre est immédiatement publiée.
    """

    permission_classes = [
        IsAuthenticated,
        CanModerateOffer,
    ]

    @transaction.atomic
    def post(self, request, pk):

        offre = get_object_or_404(
            Offre,
            pk=pk,
        )

        if offre.statut not in [Offre.Status.BROUILLON, Offre.Status.EN_ATTENTE]:
            return Response({"detail": "Seuls les brouillons et les offres en attente peuvent être validés."}, status=400)
        if offre.statut == Offre.Status.BROUILLON and (not offre.diplome_requis.strip() or not offre.competences):
            return Response({"detail": "Complétez le diplôme et les compétences requises avant validation."}, status=400)

        if offre.date_limite < timezone.localdate() or offre.entreprise.is_suspended or not offre.entreprise.is_active:
            return Response({"detail":"Cette offre ne peut plus être publiée."},status=400)
        offre.moderation_status = (
            Offre.ModerationStatus.APPROUVEE
        )

        offre.motif_rejet = ""

        offre.save(
            update_fields=[
                "moderation_status",
                "motif_rejet",
                "updated_at",
            ]
        )

        offre.publier()
        from plateforme.signals import record_admin
        record_admin(request.user,"offer",pk,"approve")
        return Response(
            {
                "detail": (
                    "L'offre a été approuvée et publiée."
                ),
                "offre": OffreAdminSerializer(
                    offre,
                    context={"request": request},
                ).data,
            }
        )


# ============================================================
# REJET ADMIN
# ============================================================

class OffreRejectView(APIView):
    """
    Rejet d'une offre avec motif obligatoire.
    """

    permission_classes = [
        IsAuthenticated,
        CanModerateOffer,
    ]

    def post(self, request, pk):

        offre = get_object_or_404(
            Offre,
            pk=pk,
        )

        motif = request.data.get(
            "motif",
            ""
        ).strip()

        if not motif:
            return Response(
                {
                    "motif": (
                        "Le motif du rejet est obligatoire."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        offre.rejeter(motif)
        from plateforme.signals import record_admin
        record_admin(request.user,"offer",pk,"reject",motif)

        return Response(
            {
                "detail": "L'offre a été rejetée.",
                "motif_rejet": offre.motif_rejet,
                "offre": OffreAdminSerializer(offre,context={"request":request}).data,
            }
        )


# ============================================================
# ARCHIVAGE
# ============================================================

class OffreArchiveView(APIView):
    """
    Archive une offre.

    Utilisé principalement par le recruteur lorsqu'il
    souhaite retirer une offre sans supprimer son historique.
    """

    permission_classes = [
        IsAuthenticated,
        CanManageOffer,
    ]

    def post(self, request, pk):

        offre = get_object_or_404(
            Offre,
            pk=pk,
        )

        self.check_object_permissions(
            request,
            offre,
        )

        if offre.statut == Offre.Status.ARCHIVEE:
            return Response(
                {
                    "detail": (
                        "Cette offre est déjà archivée."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        offre.archiver()

        return Response(
            {
                "detail": "L'offre a été archivée.",
                "statut": offre.statut,
            }
        )


# ============================================================
# RÉACTIVATION
# ============================================================

class OffreReactivateView(APIView):
    """
    Réactive une offre expirée ou archivée.
    """

    permission_classes = [
        IsAuthenticated,
        CanManageOffer,
    ]

    def post(self, request, pk):

        offre = get_object_or_404(
            Offre,
            pk=pk,
        )

        self.check_object_permissions(
            request,
            offre,
        )

        try:
            offre.reactiver()

        except Exception as exc:
            return Response(
                {
                    "detail": str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "detail": (
                    "L'offre a été réactivée."
                ),
                "statut": offre.statut,
                "date_limite": offre.date_limite,
            }
        )


# ============================================================
# LISTE DES OFFRES À MODÉRER
# ============================================================

class AdminOffersModerationListView(
    generics.ListAPIView
):
    """
    Liste des offres en attente de modération.
    """

    serializer_class = OffreAdminSerializer
    permission_classes = [
        IsAuthenticated,
        CanModerateOffer,
    ]

    def get_queryset(self):

        return Offre.objects.select_related(
            "entreprise",
            "recruteur",
        ).filter(
            moderation_status=(
                Offre.ModerationStatus.EN_ATTENTE
            )
        ).order_by(
            "created_at"
        )


# ============================================================
# LISTE ADMIN COMPLÈTE
# ============================================================

class AdminOffersListView(
    generics.ListAPIView
):
    """
    Toutes les offres accessibles à l'administrateur.
    """

    serializer_class = OffreAdminSerializer
    permission_classes = [
        IsAuthenticated,
        CanModerateOffer,
    ]

    def get_queryset(self):

        queryset = Offre.objects.select_related(
            "entreprise",
            "recruteur",
        ).all()

        statut = self.request.query_params.get(
            "statut"
        )

        if statut:
            queryset = queryset.filter(
                statut=statut
            )

        moderation_status = (
            self.request.query_params.get(
                "moderation_status"
            )
        )

        if moderation_status:
            queryset = queryset.filter(
                moderation_status=moderation_status
            )

        search = self.request.query_params.get(
            "search",
            ""
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(titre__icontains=search)
                | Q(reference__icontains=search)
                | Q(entreprise__nom__icontains=search)
                | Q(localisation__icontains=search)
            )

        return queryset.order_by(
            "-created_at"
        )


# ============================================================
# STATISTIQUES DES OFFRES
# ============================================================

class OffreStatisticsView(APIView):
    """
    Statistiques globales des offres pour l'administration.
    """

    permission_classes = [
        IsAuthenticated,
        CanModerateOffer,
    ]

    def get(self, request):

        total = Offre.objects.count()

        publiees = Offre.objects.filter(
            statut=Offre.Status.PUBLIEE
        ).count()

        brouillons = Offre.objects.filter(
            statut=Offre.Status.BROUILLON
        ).count()

        attente = Offre.objects.filter(
            moderation_status=(
                Offre.ModerationStatus.EN_ATTENTE
            )
        ).count()

        rejetees = Offre.objects.filter(
            statut=Offre.Status.REJETEE
        ).count()

        expirees = Offre.objects.filter(
            statut=Offre.Status.EXPIREE
        ).count()

        archivees = Offre.objects.filter(
            statut=Offre.Status.ARCHIVEE
        ).count()

        suspendues = Offre.objects.filter(
            statut=Offre.Status.SUSPENDUE
        ).count()

        return Response(
            {
                "total": total,
                "publiees": publiees,
                "brouillons": brouillons,
                "en_attente_moderation": attente,
                "rejetees": rejetees,
                "expirees": expirees,
                "archivees": archivees,
                "suspendues": suspendues,
            }
        )