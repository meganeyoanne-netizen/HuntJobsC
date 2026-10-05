from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


# ============================================================
# UTILISATEUR PERSONNALISÉ
# ============================================================

class User(AbstractUser):
    """
    Modèle utilisateur principal de HuntJobs.

    Chaque utilisateur possède un rôle :
    - Candidat
    - Recruteur
    - Administrateur
    """

    class Role(models.TextChoices):
        CANDIDAT = "CANDIDAT", "Candidat"
        RECRUTEUR = "RECRUTEUR", "Recruteur"
        ADMIN = "ADMIN", "Administrateur"

    email = models.EmailField(
        unique=True,
        verbose_name="Adresse e-mail"
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CANDIDAT,
        verbose_name="Rôle"
    )

    telephone = models.CharField(
        max_length=30,
        blank=True,
        verbose_name="Téléphone"
    )

    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
        verbose_name="Photo de profil"
    )

    is_suspended = models.BooleanField(
        default=False,
        verbose_name="Compte suspendu"
    )

    suspension_reason = models.TextField(
        blank=True,
        verbose_name="Motif de suspension"
    )

    suspension_date = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Date de suspension"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "username",
    ]

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_full_name()} - {self.get_role_display()}"

    @property
    def full_name(self):
        return (
            f"{self.first_name} {self.last_name}"
        ).strip()

    @property
    def is_candidate(self):
        return self.role == self.Role.CANDIDAT

    @property
    def is_recruiter(self):
        return self.role == self.Role.RECRUTEUR

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN


# ============================================================
# PROFIL CANDIDAT
# ============================================================

class ProfilCandidat(models.Model):
    """
    Informations professionnelles et personnelles
    complémentaires du candidat.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profil_candidat"
    )

    titre_professionnel = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Titre professionnel"
    )

    bio = models.TextField(
        blank=True,
        verbose_name="Présentation"
    )

    localisation = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Localisation"
    )

    date_naissance = models.DateField(
        blank=True,
        null=True
    )

    disponibilite = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Disponibilité"
    )

    annees_experience = models.PositiveIntegerField(
        default=0,
        verbose_name="Années d'expérience"
    )

    competences = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Compétences"
    )

    formations = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Formations"
    )

    experiences = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Expériences professionnelles"
    )

    langues = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Langues"
    )

    linkedin_url = models.URLField(
        blank=True
    )

    github_url = models.URLField(
        blank=True
    )

    portfolio_url = models.URLField(
        blank=True
    )

    profile_completion = models.PositiveIntegerField(
        default=0,
        verbose_name="Pourcentage de complétion"
    )

    is_profile_public = models.BooleanField(
        default=True,
        verbose_name="Profil public"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = "Profil candidat"
        verbose_name_plural = "Profils candidats"

    def __str__(self):
        return (
            f"Profil candidat - "
            f"{self.user.get_full_name()}"
        )


# ============================================================
# PROFIL RECRUTEUR
# ============================================================

class ProfilRecruteur(models.Model):
    """
    Profil professionnel du recruteur.

    Les informations spécifiques à l'entreprise
    sont stockées dans le modèle Entreprise.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profil_recruteur"
    )

    poste = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Poste occupé"
    )

    telephone_professionnel = models.CharField(
        max_length=30,
        blank=True,
        verbose_name="Téléphone professionnel"
    )

    fonction = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Fonction"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = "Profil recruteur"
        verbose_name_plural = "Profils recruteurs"

    def __str__(self):
        return (
            f"Profil recruteur - "
            f"{self.user.get_full_name()}"
        )


# ============================================================
# ENTREPRISE
# ============================================================

class Entreprise(models.Model):
    """
    Informations de l'entreprise du recruteur.

    Logique de vérification HuntJobs :

    L'entreprise peut :
    - créer un compte ;
    - compléter son profil plus tard ;
    - publier des offres même avant vérification ;
    - demander une vérification.

    Une fois soumis :
    - NUI verrouillé ;
    - e-mail professionnel verrouillé.

    Pour modifier ces informations :
    - l'entreprise contacte l'administrateur ;
    - l'administrateur autorise temporairement
      la modification.
    """

    class VerificationStatus(models.TextChoices):
        NOT_STARTED = (
            "NOT_STARTED",
            "Non commencée"
        )

        IN_PROGRESS = (
            "IN_PROGRESS",
            "En cours"
        )

        PENDING = (
            "PENDING",
            "En attente de validation"
        )

        VERIFIED = (
            "VERIFIED",
            "Entreprise vérifiée"
        )

        REJECTED = (
            "REJECTED",
            "Vérification refusée"
        )

        SUSPENDED = (
            "SUSPENDED",
            "Entreprise suspendue"
        )

    profil_recruteur = models.OneToOneField(
        ProfilRecruteur,
        on_delete=models.CASCADE,
        related_name="entreprise"
    )

    # --------------------------------------------------------
    # INFORMATIONS GENERALES
    # --------------------------------------------------------

    nom = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Nom de l'entreprise"
    )

    secteur_activite = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Secteur d'activité"
    )

    taille = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Taille de l'entreprise"
    )

    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )

    site_web = models.URLField(
        blank=True,
        verbose_name="Site web"
    )

    linkedin_url = models.URLField(
        blank=True,
        verbose_name="LinkedIn"
    )

    localisation = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Localisation"
    )

    adresse = models.TextField(
        blank=True,
        verbose_name="Adresse"
    )

    telephone = models.CharField(
        max_length=30,
        blank=True,
        verbose_name="Téléphone"
    )

    logo = models.ImageField(
        upload_to="entreprises/logos/",
        blank=True,
        null=True,
        verbose_name="Logo"
    )

    # --------------------------------------------------------
    # INFORMATIONS DE VERIFICATION
    # --------------------------------------------------------

    email_professionnel = models.EmailField(
        blank=True,
        verbose_name="E-mail professionnel"
    )

    nui = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Numéro d'identifiant unique"
    )

    document_immatriculation = models.FileField(
        upload_to="entreprises/verification/",
        blank=True,
        null=True,
        verbose_name="Document d'immatriculation"
    )

    preuve_activite = models.FileField(
        upload_to="entreprises/verification/",
        blank=True,
        null=True,
        verbose_name="Preuve d'activité"
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.NOT_STARTED,
        verbose_name="Statut de vérification"
    )

    verification_requested_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Date de demande de vérification"
    )

    verified_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Date de vérification"
    )

    verification_comment = models.TextField(
        blank=True,
        verbose_name="Commentaire de vérification"
    )

    # --------------------------------------------------------
    # VERROUILLAGE DES INFORMATIONS SENSIBLES
    # --------------------------------------------------------

    email_professionnel_locked = models.BooleanField(
        default=False,
        verbose_name="E-mail professionnel verrouillé"
    )

    nui_locked = models.BooleanField(
        default=False,
        verbose_name="NUI verrouillé"
    )

    email_modification_allowed = models.BooleanField(
        default=False,
        verbose_name="Modification e-mail autorisée"
    )

    nui_modification_allowed = models.BooleanField(
        default=False,
        verbose_name="Modification NUI autorisée"
    )

    modification_request_reason = models.TextField(
        blank=True,
        verbose_name="Motif de demande de modification"
    )

    modification_request_date = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Date de demande de modification"
    )

    # --------------------------------------------------------
    # STATUT
    # --------------------------------------------------------

    is_active = models.BooleanField(
        default=True,
        verbose_name="Entreprise active"
    )

    is_suspended = models.BooleanField(
        default=False,
        verbose_name="Entreprise suspendue"
    )

    suspension_reason = models.TextField(
        blank=True,
        verbose_name="Motif de suspension"
    )

    suspension_date = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = "Entreprise"
        verbose_name_plural = "Entreprises"
        ordering = ["nom"]

    def __str__(self):
        return (
            self.nom
            or f"Entreprise de "
            f"{self.profil_recruteur.user.get_full_name()}"
        )

    # ========================================================
    # VALIDATION DES DONNEES
    # ========================================================

    def clean(self):
        """
        Empêche la modification directe du NUI
        et de l'e-mail professionnel lorsqu'ils
        sont verrouillés.
        """

        if not self.pk:
            return

        ancienne_entreprise = (
            Entreprise.objects.get(pk=self.pk)
        )

        # Vérification du NUI
        if (
            ancienne_entreprise.nui_locked
            and not ancienne_entreprise.nui_modification_allowed
            and ancienne_entreprise.nui != self.nui
        ):
            raise ValidationError(
                {
                    "nui": (
                        "Le NUI est verrouillé. "
                        "Vous devez contacter "
                        "l'administrateur pour "
                        "autoriser sa modification."
                    )
                }
            )

        # Vérification de l'e-mail professionnel
        if (
            ancienne_entreprise.email_professionnel_locked
            and not ancienne_entreprise.email_modification_allowed
            and (
                ancienne_entreprise.email_professionnel
                != self.email_professionnel
            )
        ):
            raise ValidationError(
                {
                    "email_professionnel": (
                        "L'e-mail professionnel est "
                        "verrouillé. Vous devez "
                        "contacter l'administrateur "
                        "pour autoriser sa modification."
                    )
                }
            )

    # ========================================================
    # DEMANDE DE VERIFICATION
    # ========================================================

    def request_verification(self):
        """
        L'entreprise soumet son dossier
        de vérification.
        """

        self.verification_status = (
            self.VerificationStatus.PENDING
        )

        self.verification_requested_at = (
            timezone.now()
        )

        # Les informations deviennent verrouillées
        if self.email_professionnel:
            self.email_professionnel_locked = True

        if self.nui:
            self.nui_locked = True

        self.save()

    # ========================================================
    # VALIDATION PAR ADMIN
    # ========================================================

    def verify(self):
        """
        Validation de l'entreprise par
        l'administrateur.
        """

        self.verification_status = (
            self.VerificationStatus.VERIFIED
        )

        self.verified_at = timezone.now()

        self.verification_comment = ""

        self.save()

    # ========================================================
    # REFUS PAR ADMIN
    # ========================================================

    def reject_verification(self, reason=""):
        """
        Refus de la vérification.
        """

        self.verification_status = (
            self.VerificationStatus.REJECTED
        )

        self.verification_comment = reason

        self.save()

    # ========================================================
    # AUTORISATION DE MODIFICATION
    # ========================================================

    def allow_email_modification(self):
        """
        Autorise temporairement la modification
        de l'e-mail professionnel.
        """

        self.email_modification_allowed = True

        self.save()

    def allow_nui_modification(self):
        """
        Autorise temporairement la modification
        du NUI.
        """

        self.nui_modification_allowed = True

        self.save()

    # ========================================================
    # SUSPENSION
    # ========================================================

    def suspend(self, reason=""):
        """
        Suspend l'entreprise.
        """

        self.is_suspended = True

        self.is_active = False

        self.suspension_reason = reason

        self.suspension_date = timezone.now()

        self.verification_status = (
            self.VerificationStatus.SUSPENDED
        )

        self.save()

    def reactivate(self):
        """
        Réactive l'entreprise.
        """

        self.is_suspended = False

        self.is_active = True

        self.suspension_reason = ""

        self.suspension_date = None

        self.save()


# ============================================================
# CV DU CANDIDAT
# ============================================================

class CV(models.Model):
    """
    CV associé à un candidat.

    Le candidat peut disposer :
    - d'un CV en ligne ;
    - d'un CV PDF uploadé.

    HuntJobs exige la présence d'un CV
    avant de permettre une candidature.
    """

    candidat = models.ForeignKey(
        ProfilCandidat,
        on_delete=models.CASCADE,
        related_name="cvs"
    )

    titre = models.CharField(
        max_length=255,
        default="Mon CV"
    )

    fichier = models.FileField(
        upload_to="cvs/",
        blank=True,
        null=True,
        verbose_name="Fichier CV"
    )

    contenu_en_ligne = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="CV en ligne"
    )

    is_primary = models.BooleanField(
        default=False,
        verbose_name="CV principal"
    )

    is_generated = models.BooleanField(
        default=False,
        verbose_name="CV généré par HuntJobs"
    )

    template_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Template utilisé"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = "CV"
        verbose_name_plural = "CV"
        constraints = [models.UniqueConstraint(fields=["candidat"], condition=models.Q(is_primary=True), name="unique_primary_cv")]

    def __str__(self):
        return (
            f"{self.titre} - "
            f"{self.candidat.user.get_full_name()}"
        )

    def clean(self):
        """
        Un candidat ne doit avoir qu'un seul
        CV principal.
        """

        if self.is_primary:
            query = CV.objects.filter(
                candidat=self.candidat,
                is_primary=True
            )

            if self.pk:
                query = query.exclude(
                    pk=self.pk
                )

            if query.exists():
                raise ValidationError(
                    "Un seul CV peut être défini "
                    "comme principal."
                )


# ============================================================
# DOCUMENTS CANDIDAT
# ============================================================

class Document(models.Model):
    """
    Documents complémentaires du candidat.

    Exemples :
    - Lettre de motivation
    - Portfolio
    - Certificat
    - Document généré par HuntJobs
    """

    class DocumentType(models.TextChoices):
        CV = "CV", "CV"
        COVER_LETTER = (
            "COVER_LETTER",
            "Lettre de motivation"
        )
        PORTFOLIO = (
            "PORTFOLIO",
            "Portfolio"
        )
        CERTIFICATE = (
            "CERTIFICATE",
            "Certificat"
        )
        OTHER = (
            "OTHER",
            "Autre"
        )

    candidat = models.ForeignKey(
        ProfilCandidat,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    document_type = models.CharField(
        max_length=30,
        choices=DocumentType.choices,
        default=DocumentType.OTHER
    )

    titre = models.CharField(
        max_length=255
    )

    fichier = models.FileField(
        upload_to="documents/"
    )

    is_generated = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.titre} - "
            f"{self.candidat.user.get_full_name()}"
        )
