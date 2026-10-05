from django.utils import timezone

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User,
    ProfilCandidat,
    ProfilRecruteur,
    Entreprise,
    CV,
    Document,
)

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ProfilCandidatSerializer,
    ProfilRecruteurSerializer,
    EntrepriseSerializer,
    EntrepriseVerificationSerializer,
    EntrepriseModificationRequestSerializer,
    CVSerializer,
    DocumentSerializer,
    MeSerializer,
    generate_tokens_for_user,
)

from .permissions import (
    IsCandidate,
    IsRecruiter,
    IsAdmin,
)


# ============================================================
# INSCRIPTION
# ============================================================

class RegisterView(APIView):
    from .account_views import AuthThrottle
    throttle_classes = [AuthThrottle]
    """
    Inscription publique sur HuntJobs.

    Accessible aux :
    - Candidats
    - Recruteurs

    Les administrateurs ne peuvent pas être créés
    via cette API.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        from plateforme.platform_settings import get_platform_settings
        from rest_framework.exceptions import PermissionDenied
        if not get_platform_settings()["allowRegistration"]:
            raise PermissionDenied("Les nouvelles inscriptions sont temporairement désactivées.")


        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        tokens = generate_tokens_for_user(
            user
        )

        return Response(
            {
                "message": (
                    "Inscription réussie."
                ),
                "user": UserSerializer(user).data,
                "tokens": tokens,
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# CONNEXION
# ============================================================

class LoginView(APIView):
    from .account_views import AuthThrottle
    throttle_classes = [AuthThrottle]
    """
    Connexion d'un utilisateur HuntJobs
    avec son e-mail et son mot de passe.
    """

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data,
            context={
                "request": request
            },
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data[
            "user"
        ]

        tokens = generate_tokens_for_user(
            user
        )

        return Response(
            {
                "message": (
                    "Connexion réussie."
                ),
                "user": UserSerializer(user).data,
                "tokens": tokens,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# UTILISATEUR CONNECTÉ
# ============================================================

class MeView(APIView):
    """
    Retourne les informations de
    l'utilisateur actuellement connecté.
    """

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        serializer = MeSerializer(
            request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        """
        Mise à jour des informations générales
        de l'utilisateur connecté.
        """

        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": (
                    "Profil utilisateur mis à jour."
                ),
                "user": UserSerializer(
                    request.user
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# DECONNEXION
# ============================================================

class LogoutView(APIView):
    """
    Déconnexion.

    Le frontend envoie le refresh token
    afin de l'invalider.
    """

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        refresh_token = request.data.get(
            "refresh"
        )

        if not refresh_token:

            return Response(
                {
                    "detail": (
                        "Le refresh token est requis."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            token = RefreshToken(
                refresh_token
            )

            token.blacklist()

            return Response(
                {
                    "message": (
                        "Déconnexion réussie."
                    )
                },
                status=status.HTTP_200_OK,
            )

        except Exception:

            return Response(
                {
                    "detail": (
                        "Token invalide ou expiré."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


# ============================================================
# PROFIL CANDIDAT
# ============================================================

class CandidateProfileView(APIView):
    """
    Consultation et modification
    du profil du candidat connecté.
    """

    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get(self, request):

        profil, created = (
            ProfilCandidat.objects.get_or_create(
                user=request.user
            )
        )

        serializer = ProfilCandidatSerializer(
            profil
        )

        return Response(
            serializer.data
        )

    def patch(self, request):

        profil, created = (
            ProfilCandidat.objects.get_or_create(
                user=request.user
            )
        )

        serializer = ProfilCandidatSerializer(
            profil,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": (
                    "Profil candidat mis à jour."
                ),
                "profile": serializer.data,
            }
        )


# ============================================================
# PROFIL RECRUTEUR
# ============================================================

class RecruiterProfileView(APIView):
    """
    Consultation et modification
    du profil recruteur connecté.
    """

    permission_classes = [
        IsAuthenticated,
        IsRecruiter,
    ]

    def get(self, request):

        profil, created = (
            ProfilRecruteur.objects.get_or_create(
                user=request.user
            )
        )

        serializer = ProfilRecruteurSerializer(
            profil
        )

        return Response(
            serializer.data
        )

    def patch(self, request):

        profil, created = (
            ProfilRecruteur.objects.get_or_create(
                user=request.user
            )
        )

        serializer = ProfilRecruteurSerializer(
            profil,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": (
                    "Profil recruteur mis à jour."
                ),
                "profile": serializer.data,
            }
        )


# ============================================================
# ENTREPRISE DU RECRUTEUR
# ============================================================

class RecruiterCompanyView(APIView):
    """
    Consultation et modification
    de l'entreprise du recruteur connecté.
    """

    permission_classes = [
        IsAuthenticated,
        IsRecruiter,
    ]

    def get_company(self, user):

        profil, created = (
            ProfilRecruteur.objects.get_or_create(
                user=user
            )
        )

        entreprise, created = (
            Entreprise.objects.get_or_create(
                profil_recruteur=profil
            )
        )

        return entreprise

    def get(self, request):

        entreprise = self.get_company(
            request.user
        )

        serializer = EntrepriseSerializer(
            entreprise
        )

        return Response(
            serializer.data
        )

    def patch(self, request):

        entreprise = self.get_company(
            request.user
        )

        serializer = EntrepriseSerializer(
            entreprise,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        entreprise = serializer.save()

        return Response(
            {
                "message": (
                    "Informations de l'entreprise "
                    "mises à jour."
                ),
                "company": (
                    EntrepriseSerializer(
                        entreprise
                    ).data
                ),
            }
        )


# ============================================================
# DEMANDE DE VERIFICATION ENTREPRISE
# ============================================================

class RequestCompanyVerificationView(
    APIView
):
    """
    Permet au recruteur de soumettre
    les informations nécessaires pour
    la vérification de son entreprise.

    Après soumission :
    - NUI verrouillé
    - E-mail professionnel verrouillé
    - Statut = PENDING
    """

    permission_classes = [
        IsAuthenticated,
        IsRecruiter,
    ]

    def post(self, request):

        profil, created = (
            ProfilRecruteur.objects.get_or_create(
                user=request.user
            )
        )

        entreprise, created = (
            Entreprise.objects.get_or_create(
                profil_recruteur=profil
            )
        )

        serializer = (
            EntrepriseVerificationSerializer(
                data=request.data,
                context={"entreprise": entreprise}
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        # Mise à jour des informations
        entreprise.email_professionnel = (
            data["email_professionnel"]
        )

        entreprise.nui = data["nui"]

        entreprise.document_immatriculation = (
            data.get("document_immatriculation", entreprise.document_immatriculation)
        )

        entreprise.preuve_activite = (
            data.get("preuve_activite", entreprise.preuve_activite)
        )

        # Soumission
        entreprise.request_verification()

        return Response(
            {
                "message": (
                    "Votre demande de vérification "
                    "a été envoyée à l'administrateur."
                ),
                "company": (
                    EntrepriseSerializer(
                        entreprise
                    ).data
                ),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# DEMANDE DE MODIFICATION
# ============================================================

class RequestCompanyModificationView(
    APIView
):
    """
    Le recruteur demande à l'administrateur
    l'autorisation de modifier :

    - le NUI ;
    - l'e-mail professionnel ;
    - ou les deux.
    """

    permission_classes = [
        IsAuthenticated,
        IsRecruiter,
    ]

    def post(self, request):

        serializer = (
            EntrepriseModificationRequestSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        profil, created = (
            ProfilRecruteur.objects.get_or_create(
                user=request.user
            )
        )

        entreprise, created = (
            Entreprise.objects.get_or_create(
                profil_recruteur=profil
            )
        )

        field = serializer.validated_data[
            "field"
        ]

        reason = serializer.validated_data[
            "reason"
        ]

        entreprise.modification_request_reason = (
            reason
        )

        entreprise.modification_request_date = (
            timezone.now()
        )

        entreprise.save()

        return Response(
            {
                "message": (
                    "Votre demande de modification "
                    "a été envoyée à l'administrateur."
                ),
                "field": field,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# CV DU CANDIDAT
# ============================================================

class CVListCreateView(
    generics.ListCreateAPIView
):
    """
    Liste et création des CV
    du candidat connecté.
    """

    serializer_class = CVSerializer

    def perform_destroy(self, instance):
        from .file_views import delete_cv
        delete_cv(instance)

    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get_queryset(self):

        profil, created = (
            ProfilCandidat.objects.get_or_create(
                user=self.request.user
            )
        )

        return CV.objects.filter(
            candidat=profil
        ).order_by(
            "-is_primary",
            "-created_at",
        )

    def get_serializer_context(self):

        context = super().get_serializer_context()

        profil, created = (
            ProfilCandidat.objects.get_or_create(
                user=self.request.user
            )
        )

        context["candidat"] = profil

        return context

    def perform_create(
        self,
        serializer
    ):

        profil, created = (
            ProfilCandidat.objects.get_or_create(
                user=self.request.user
            )
        )

        serializer.save(
            candidat=profil
        )


# ============================================================
# DETAIL CV
# ============================================================

class CVDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    def perform_destroy(self, instance):
        from .file_views import delete_cv
        delete_cv(instance)

    """
    Consultation, modification et suppression
    d'un CV appartenant au candidat connecté.
    """

    serializer_class = CVSerializer

    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get_queryset(self):

        profil, created = (
            ProfilCandidat.objects.get_or_create(
                user=self.request.user
            )
        )

        return CV.objects.filter(
            candidat=profil
        )


# ============================================================
# DOCUMENTS DU CANDIDAT
# ============================================================

class DocumentListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = DocumentSerializer

    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get_queryset(self):

        profil, created = (
            ProfilCandidat.objects.get_or_create(
                user=self.request.user
            )
        )

        return Document.objects.filter(
            candidat=profil
        ).order_by(
            "-created_at"
        )

    def perform_create(
        self,
        serializer
    ):

        profil, created = (
            ProfilCandidat.objects.get_or_create(
                user=self.request.user
            )
        )

        serializer.save(
            candidat=profil
        )


# ============================================================
# DETAIL DOCUMENT
# ============================================================

class DocumentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = DocumentSerializer

    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get_queryset(self):

        profil, created = (
            ProfilCandidat.objects.get_or_create(
                user=self.request.user
            )
        )

        return Document.objects.filter(
            candidat=profil
        )