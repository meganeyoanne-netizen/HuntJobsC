from django.contrib.auth import authenticate
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User,
    ProfilCandidat,
    ProfilRecruteur,
    Entreprise,
    CV,
    Document,
)

# ============================================================
# UTILISATEUR
# ============================================================

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer principal de l'utilisateur connecté.
    """

    full_name = serializers.ReadOnlyField()
    is_candidate = serializers.ReadOnlyField()
    is_recruiter = serializers.ReadOnlyField()
    is_admin_role = serializers.SerializerMethodField()
    def get_is_admin_role(self, obj):
        return obj.is_admin_role or obj.is_superuser

    class Meta:
        model = User

        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "telephone",
            "avatar",
            "is_active",
            "is_suspended",
            "is_candidate",
            "is_recruiter",
            "is_admin_role",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "role",
            "is_active",
            "is_suspended",
            "created_at",
            "updated_at",
        )


# ============================================================
# INSCRIPTION
# ============================================================

class RegisterSerializer(serializers.ModelSerializer):
    company = serializers.DictField(write_only=True, required=False)
    """
    Inscription d'un utilisateur HuntJobs.

    Le rôle détermine automatiquement la création :
    - Candidat -> ProfilCandidat
    - Recruteur -> ProfilRecruteur
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User

        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "telephone",
            "role",
            "password",
            "password_confirm",
            "company",
        )

    def validate_email(self, value):
        normalized = (value or "").strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError(
                "Un utilisateur avec cette adresse e-mail existe déjà."
            )
        return normalized

    def validate_role(self, value):
        """
        Empêche la création d'un administrateur
        via l'inscription publique.
        """

        if value == User.Role.ADMIN:
            raise serializers.ValidationError(
                "Le rôle Administrateur ne peut pas être créé "
                "via l'inscription publique."
            )

        return value

    def validate(self, attrs):

        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password_confirm": (
                        "Les mots de passe ne correspondent pas."
                    )
                }
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):

        company_data = validated_data.pop("company", {})
        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        role = validated_data.get(
            "role",
            User.Role.CANDIDAT,
        )

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        # Création automatique du profil
        if role == User.Role.CANDIDAT:

            ProfilCandidat.objects.create(
                user=user
            )

        elif role == User.Role.RECRUTEUR:

            profil_recruteur = (
                ProfilRecruteur.objects.create(
                    user=user
                )
            )

            # Création automatique d'une entreprise vide.
            # Le recruteur pourra compléter le profil plus tard.
            company = Entreprise.objects.create(profil_recruteur=profil_recruteur)
            company_serializer = EntrepriseSerializer(company, data=company_data, partial=True)
            company_serializer.is_valid(raise_exception=True)
            company_serializer.save()

        return user


# ============================================================
# CONNEXION
# ============================================================

class LoginSerializer(serializers.Serializer):
    """
    Connexion par e-mail et mot de passe.
    """

    email = serializers.CharField()

    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):

        email = (attrs.get("email") or "").strip()
        password = attrs.get("password")

        # 1. Recherche par email insensible à la casse (insensible majuscules/minuscules)
        user_candidate = User.objects.filter(email__iexact=email).first()
        if not user_candidate:
            # Recherche alternative par nom d'utilisateur (username)
            user_candidate = User.objects.filter(username__iexact=email).first()

        user = None
        if user_candidate and user_candidate.check_password(password):
            user = user_candidate
        else:
            # Fallback authenticate Django standard
            user = authenticate(
                request=self.context.get("request"),
                username=email,
                password=password,
            )

        if not user:

            raise serializers.ValidationError(
                "Adresse e-mail ou mot de passe incorrect."
            )

        if not user.is_active:

            raise serializers.ValidationError(
                "Ce compte est désactivé."
            )

        if user.is_suspended:

            raise serializers.ValidationError(
                "Votre compte est actuellement suspendu."
            )

        attrs["user"] = user

        return attrs


# ============================================================
# PROFIL CANDIDAT
# ============================================================

class ProfilCandidatSerializer(serializers.ModelSerializer):
    def validate(self,attrs):
        for field in ["competences","formations","experiences","langues"]:
            if field not in attrs: continue
            value=attrs[field]
            if not isinstance(value,list) or len(value)>100:
                raise serializers.ValidationError({field:"Une liste de 100 éléments maximum est requise."})
            if field=="competences" and any(not isinstance(v,str) or len(v)>200 for v in value):
                raise serializers.ValidationError({field:"Compétences textuelles requises, maximum 200 caractères."})
            if field in ["formations","experiences"] and any(not isinstance(v,dict) for v in value):
                raise serializers.ValidationError({field:"Objets structurés requis."})
        return attrs
    def update(self,instance,validated_data):
        instance=super().update(instance,validated_data)
        fields=["titre_professionnel","bio","localisation","competences","formations","experiences","disponibilite","langues"]
        completed=sum(bool(getattr(instance,f)) for f in fields)+bool(instance.user.first_name and instance.user.last_name)+bool(instance.user.telephone)
        instance.profile_completion=completed*10
        instance.save(update_fields=["profile_completion"])
        return instance

    user = UserSerializer(
        read_only=True
    )

    class Meta:
        model = ProfilCandidat

        fields = (
            "id",
            "user",
            "titre_professionnel",
            "bio",
            "localisation",
            "date_naissance",
            "disponibilite",
            "annees_experience",
            "competences",
            "formations",
            "experiences",
            "langues",
            "linkedin_url",
            "github_url",
            "portfolio_url",
            "profile_completion",
            "is_profile_public",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "user",
            "profile_completion",
            "created_at",
            "updated_at",
        )


# ============================================================
# PROFIL RECRUTEUR
# ============================================================

class ProfilRecruteurSerializer(serializers.ModelSerializer):

    user = UserSerializer(
        read_only=True
    )

    class Meta:
        model = ProfilRecruteur

        fields = (
            "id",
            "user",
            "poste",
            "fonction",
            "telephone_professionnel",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "user",
            "created_at",
            "updated_at",
        )


# ============================================================
# ENTREPRISE
# ============================================================

class EntrepriseSerializer(serializers.ModelSerializer):
    def validate_document_immatriculation(self, value):
        from .file_views import validate_file
        return validate_file(value)
    def validate_preuve_activite(self, value):
        from .file_views import validate_file
        return validate_file(value)
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["recruteur"] = UserSerializer(instance.profil_recruteur.user).data
        data["offres_count"] = instance.offres.count()
        data["candidatures_count"] = instance.offres.aggregate(total=__import__("django.db.models", fromlist=["Sum"]).Sum("nombre_candidatures"))["total"] or 0
        for field, kind in [("document_immatriculation","immatriculation"),("preuve_activite","activite")]:
            data[field] = f"/api/fichiers/{kind}/{instance.pk}/" if getattr(instance,field) else None
        return data
    """
    Serializer complet de l'entreprise.

    Le NUI et l'e-mail professionnel sont
    automatiquement protégés par le modèle
    lorsqu'ils sont verrouillés.
    """

    profil_recruteur = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    is_verified = serializers.SerializerMethodField()

    class Meta:
        model = Entreprise

        fields = (
            "id",
            "profil_recruteur",

            # Informations générales
            "nom",
            "secteur_activite",
            "taille",
            "description",
            "site_web",
            "linkedin_url",
            "localisation",
            "adresse",
            "telephone",
            "logo",

            # Vérification
            "email_professionnel",
            "nui",
            "document_immatriculation",
            "preuve_activite",
            "verification_status",
            "verification_requested_at",
            "verified_at",
            "verification_comment",

            # Verrouillage
            "email_professionnel_locked",
            "nui_locked",
            "email_modification_allowed",
            "nui_modification_allowed",
            "modification_request_reason",
            "modification_request_date",

            # Statut
            "is_active",
            "is_suspended",
            "suspension_reason",
            "suspension_date",

            # Informations calculées
            "is_verified",

            # Dates
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "profil_recruteur",

            "verification_status",
            "verification_requested_at",
            "verified_at",
            "verification_comment",

            "email_professionnel_locked",
            "nui_locked",
            "email_modification_allowed",
            "nui_modification_allowed",

            "is_active",
            "is_suspended",
            "suspension_reason",
            "suspension_date",

            "is_verified",
            "created_at",
            "updated_at",
        )

    def get_is_verified(self, obj):

        return (
            obj.verification_status
            == Entreprise.VerificationStatus.VERIFIED
        )

    def validate(self, attrs):
        """
        Validation supplémentaire du verrouillage.

        Cette validation complète également
        la logique présente dans models.py.
        """

        instance = self.instance

        if not instance:
            return attrs

        # NUI
        if (
            "nui" in attrs
            and instance.nui_locked
            and not instance.nui_modification_allowed
            and attrs["nui"] != instance.nui
        ):

            raise serializers.ValidationError(
                {
                    "nui": (
                        "Le NUI est verrouillé. "
                        "Contactez l'administrateur pour "
                        "demander une modification."
                    )
                }
            )

        # E-mail professionnel
        if (
            "email_professionnel" in attrs
            and instance.email_professionnel_locked
            and not instance.email_modification_allowed
            and (
                attrs["email_professionnel"]
                != instance.email_professionnel
            )
        ):

            raise serializers.ValidationError(
                {
                    "email_professionnel": (
                        "L'e-mail professionnel est verrouillé. "
                        "Contactez l'administrateur pour "
                        "demander une modification."
                    )
                }
            )

        return attrs

    def update(self, instance, validated_data):

        try:

            return super().update(
                instance,
                validated_data
            )

        except DjangoValidationError as error:

            raise serializers.ValidationError(
                error.message_dict
                if hasattr(error, "message_dict")
                else error.messages
            )


# ============================================================
# DEMANDE DE VERIFICATION ENTREPRISE
# ============================================================

class EntrepriseVerificationSerializer(serializers.Serializer):
    """
    Données nécessaires pour demander
    la vérification d'une entreprise.
    """

    email_professionnel = serializers.EmailField()

    nui = serializers.CharField(
        max_length=100
    )

    document_immatriculation = serializers.FileField(required=False)

    preuve_activite = serializers.FileField()

    def validate(self, attrs):
        company = self.context.get("entreprise")
        if company:
            if company.verification_status in ["PENDING", "VERIFIED", "SUSPENDED"]:
                raise serializers.ValidationError("Cette entreprise ne peut pas être soumise dans son état actuel.")
            for field in ["document_immatriculation", "preuve_activite"]:
                if not attrs.get(field) and not getattr(company, field):
                    raise serializers.ValidationError({field: "Document obligatoire."})
            EntrepriseSerializer(company, data={k: v for k,v in attrs.items() if k in ["email_professionnel","nui"]}, partial=True).is_valid(raise_exception=True)
        for field in ["document_immatriculation", "preuve_activite"]:
            file = attrs.get(field)
            if file and (file.size > 10*1024*1024 or file.name.rsplit(".",1)[-1].lower() not in ["pdf","png","jpg","jpeg"]):
                raise serializers.ValidationError({field: "PDF ou image, maximum 10 Mo."})

        if not attrs.get("email_professionnel"):

            raise serializers.ValidationError(
                {
                    "email_professionnel": (
                        "L'e-mail professionnel est obligatoire."
                    )
                }
            )

        if not attrs.get("nui"):

            raise serializers.ValidationError(
                {
                    "nui": (
                        "Le NUI est obligatoire."
                    )
                }
            )

        return attrs


# ============================================================
# DEMANDE DE MODIFICATION ENTREPRISE
# ============================================================

class EntrepriseModificationRequestSerializer(
    serializers.Serializer
):
    """
    Permet à une entreprise de demander
    l'autorisation de modifier le NUI ou
    l'e-mail professionnel.
    """

    FIELD_CHOICES = (
        ("email_professionnel", "E-mail professionnel"),
        ("nui", "NUI"),
        ("both", "Les deux"),
    )

    field = serializers.ChoiceField(
        choices=FIELD_CHOICES
    )

    reason = serializers.CharField(
        min_length=10
    )


# ============================================================
# CV
# ============================================================

class CVSerializer(serializers.ModelSerializer):
    def validate_fichier(self, value):
        from .file_views import validate_file
        return validate_file(value, pdf_only=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["fichier"] = f"/api/fichiers/cv/{instance.pk}/" if instance.fichier else None
        return data

    class Meta:
        model = CV

        fields = (
            "id",
            "candidat",
            "titre",
            "fichier",
            "contenu_en_ligne",
            "is_primary",
            "is_generated",
            "template_name",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "candidat",
            "is_generated",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):

        instance = self.instance

        candidat = (
            instance.candidat
            if instance
            else self.context.get("candidat")
        )

        if (
            attrs.get("is_primary", False)
            and candidat
        ):

            query = CV.objects.filter(
                candidat=candidat,
                is_primary=True,
            )

            if instance:
                query = query.exclude(
                    pk=instance.pk
                )

            if query.exists():

                raise serializers.ValidationError(
                    {
                        "is_primary": (
                            "Un CV principal existe déjà."
                        )
                    }
                )

        return attrs


# ============================================================
# DOCUMENT
# ============================================================

class DocumentSerializer(serializers.ModelSerializer):
    def validate_fichier(self, value):
        from .file_views import validate_file
        return validate_file(value)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["fichier"] = f"/api/fichiers/document/{instance.pk}/"
        return data

    class Meta:
        model = Document

        fields = (
            "id",
            "candidat",
            "document_type",
            "titre",
            "fichier",
            "is_generated",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "candidat",
            "is_generated",
            "created_at",
            "updated_at",
        )

# ============================================================
# UTILISATEUR CONNECTÉ + PROFIL
# ============================================================

class MeSerializer(serializers.ModelSerializer):
    """
    Retourne l'utilisateur connecté avec
    les informations principales de son profil.
    """

    full_name = serializers.ReadOnlyField()
    is_admin_role = serializers.SerializerMethodField()
    def get_is_admin_role(self,obj):
        return obj.is_admin_role or obj.is_superuser

    profil_candidat = ProfilCandidatSerializer(
        read_only=True
    )

    profil_recruteur = ProfilRecruteurSerializer(
        read_only=True
    )

    class Meta:
        model = User

        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "is_admin_role",
            "telephone",
            "avatar",
            "is_active",
            "is_suspended",

            "profil_candidat",
            "profil_recruteur",

            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "role",
            "is_active",
            "is_suspended",
            "created_at",
            "updated_at",
        )


# ============================================================
# REPONSE DE CONNEXION
# ============================================================

class LoginResponseSerializer(serializers.Serializer):
    """
    Structure documentaire de la réponse
    renvoyée après une connexion réussie.

    Ce serializer pourra également être utilisé
    dans une documentation API.
    """

    access = serializers.CharField()

    refresh = serializers.CharField()

    user = UserSerializer()


# ============================================================
# GENERATION JWT
# ============================================================

def generate_tokens_for_user(user):
    """
    Génère les tokens JWT pour un utilisateur.
    """

    refresh = RefreshToken.for_user(user)

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }