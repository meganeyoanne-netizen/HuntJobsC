from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
import uuid
from django.utils import timezone
from django.utils.text import slugify


class Offre(models.Model):
    """
    Modèle représentant une offre d'emploi ou de stage publiée
    par une entreprise sur HuntJobs.
    """

    class ContractType(models.TextChoices):
        CDI = "CDI", "CDI"
        CDD = "CDD", "CDD"
        STAGE = "STAGE", "Stage"
        ALTERNANCE = "ALTERNANCE", "Alternance"
        FREELANCE = "FREELANCE", "Freelance"

    class WorkMode(models.TextChoices):
        SUR_SITE = "SUR_SITE", "Sur site"
        HYBRIDE = "HYBRIDE", "Hybride"
        DISTANCIEL = "DISTANCIEL", "À distance"

    class ExperienceLevel(models.TextChoices):
        DEBUTANT = "DEBUTANT", "Débutant"
        INTERMEDIAIRE = "INTERMEDIAIRE", "Intermédiaire"
        SENIOR = "SENIOR", "Senior"
        EXPERT = "EXPERT", "Expert"

    class EducationLevel(models.TextChoices):
        AUCUN = "AUCUN", "Aucun diplôme spécifique"
        BEPC = "BEPC", "BEPC"
        PROBATOIRE = "PROBATOIRE", "Probatoire"
        BAC = "BAC", "Baccalauréat"
        BAC2 = "BAC+2", "Bac+2"
        BAC3 = "BAC+3", "Bac+3 / Licence"
        BAC4 = "BAC+4", "Bac+4"
        BAC5 = "BAC+5", "Bac+5 / Master"
        DOCTORAT = "DOCTORAT", "Doctorat"

    class Status(models.TextChoices):
        BROUILLON = "BROUILLON", "Brouillon"
        EN_ATTENTE = "EN_ATTENTE", "En attente de modération"
        PUBLIEE = "PUBLIEE", "Publiée"
        REJETEE = "REJETEE", "Rejetée"
        SUSPENDUE = "SUSPENDUE", "Suspendue"
        EXPIREE = "EXPIREE", "Expirée"
        ARCHIVEE = "ARCHIVEE", "Archivée"

    class ModerationStatus(models.TextChoices):
        NON_SOUMISE = "NON_SOUMISE", "Non soumise"
        EN_ATTENTE = "EN_ATTENTE", "En attente"
        APPROUVEE = "APPROUVEE", "Approuvée"
        REJETEE = "REJETEE", "Rejetée"

    # ------------------------------------------------------------------
    # Identification
    # ------------------------------------------------------------------

    titre = models.CharField(
        max_length=255,
        verbose_name="Titre de l'offre"
    )

    reference = models.CharField(
        max_length=30,
        unique=True,
        blank=True,
        verbose_name="Référence"
    )

    slug = models.SlugField(
        max_length=280,
        unique=True,
        blank=True
    )

    # ------------------------------------------------------------------
    # Relations
    # ------------------------------------------------------------------

    entreprise = models.ForeignKey(
        "users.Entreprise",
        on_delete=models.CASCADE,
        related_name="offres",
        verbose_name="Entreprise"
    )

    recruteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="offres_recruteur",
        verbose_name="Recruteur"
    )

    # ------------------------------------------------------------------
    # Description
    # ------------------------------------------------------------------

    description = models.TextField(
        verbose_name="Description"
    )

    missions = models.TextField(
        blank=True,
        verbose_name="Missions"
    )

    profil_recherche = models.TextField(
        blank=True,
        verbose_name="Profil recherché"
    )

    # ------------------------------------------------------------------
    # Conditions
    # ------------------------------------------------------------------

    type_contrat = models.CharField(
        max_length=20,
        choices=ContractType.choices,
        verbose_name="Type de contrat"
    )

    niveau_experience = models.CharField(
        max_length=20,
        choices=ExperienceLevel.choices,
        default=ExperienceLevel.DEBUTANT,
        verbose_name="Niveau d'expérience"
    )

    experience_requise = models.PositiveIntegerField(
        default=0,
        verbose_name="Années d'expérience requises"
    )

    niveau_etudes = models.CharField(
        max_length=20,
        choices=EducationLevel.choices,
        default=EducationLevel.AUCUN,
        verbose_name="Niveau d'études requis"
    )

    diplome_requis = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Diplôme requis"
    )

    # ------------------------------------------------------------------
    # Compétences
    # ------------------------------------------------------------------

    competences = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Compétences requises"
    )

    competences_validees = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Compétences validées"
    )

    # ------------------------------------------------------------------
    # Localisation
    # ------------------------------------------------------------------

    localisation = models.CharField(
        max_length=255,
        verbose_name="Localisation"
    )

    mode_travail = models.CharField(
        max_length=20,
        choices=WorkMode.choices,
        default=WorkMode.SUR_SITE,
        verbose_name="Mode de travail"
    )

    # ------------------------------------------------------------------
    # Rémunération
    # ------------------------------------------------------------------

    salaire_min = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Salaire minimum"
    )

    salaire_max = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Salaire maximum"
    )

    devise = models.CharField(
        max_length=10,
        default="XAF",
        verbose_name="Devise"
    )

    salaire_confidentiel = models.BooleanField(
        default=False,
        verbose_name="Salaire confidentiel"
    )

    # ------------------------------------------------------------------
    # Avantages
    # ------------------------------------------------------------------

    avantages = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Avantages"
    )

    # ------------------------------------------------------------------
    # Média / flyer
    # ------------------------------------------------------------------

    flyer = models.ImageField(
        upload_to="offres/flyers/",
        null=True,
        blank=True,
        verbose_name="Flyer de l'offre"
    )

    # ------------------------------------------------------------------
    # Dates
    # ------------------------------------------------------------------

    date_publication = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de publication"
    )

    date_limite = models.DateField(
        verbose_name="Date limite de candidature"
    )

    date_expiration = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'expiration"
    )

    date_archivage = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'archivage"
    )

    # ------------------------------------------------------------------
    # Statut / modération
    # ------------------------------------------------------------------

    statut = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.BROUILLON,
        verbose_name="Statut"
    )

    moderation_status = models.CharField(
        max_length=20,
        choices=ModerationStatus.choices,
        default=ModerationStatus.NON_SOUMISE,
        verbose_name="Statut de modération"
    )

    motif_rejet = models.TextField(
        blank=True,
        verbose_name="Motif du rejet"
    )

    motif_suspension = models.TextField(
        blank=True,
        verbose_name="Motif de suspension"
    )

    # ------------------------------------------------------------------
    # Statistiques
    # ------------------------------------------------------------------

    nombre_vues = models.PositiveIntegerField(
        default=0,
        verbose_name="Nombre de vues"
    )

    nombre_candidatures = models.PositiveIntegerField(
        default=0,
        verbose_name="Nombre de candidatures"
    )

    # ------------------------------------------------------------------
    # Métadonnées
    # ------------------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = "Offre"
        verbose_name_plural = "Offres"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["statut"]),
            models.Index(fields=["type_contrat"]),
            models.Index(fields=["date_limite"]),
            models.Index(fields=["entreprise"]),
            models.Index(fields=["recruteur"]),
            models.Index(fields=["moderation_status"]),
        ]

    def __str__(self):
        return f"{self.titre} - {self.reference}"

    # ------------------------------------------------------------------
    # Génération de référence
    # ------------------------------------------------------------------

    def generate_reference(self):
        """
        Génère une référence unique du type :
        HJ-2026-00001
        """
        if self.reference:
            return self.reference

        year = timezone.now().year

        last_offer = (
            Offre.objects
            .filter(reference__startswith=f"HJ-{year}-")
            .order_by("-id")
            .first()
        )

        if last_offer and last_offer.reference:
            try:
                last_number = int(last_offer.reference.split("-")[-1])
                number = last_number + 1
            except (ValueError, IndexError):
                number = self.pk or 1
        else:
            number = self.pk or 1

        return f"HJ-{year}-{number:05d}"

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def clean(self):
        super().clean()

        if self.salaire_min is not None and self.salaire_max is not None:
            if self.salaire_min > self.salaire_max:
                raise ValidationError({
                    "salaire_max": (
                        "Le salaire maximum doit être supérieur "
                        "ou égal au salaire minimum."
                    )
                })

        if self.date_limite and self.date_limite < timezone.localdate():
            if self.statut not in [
                self.Status.EXPIREE,
                self.Status.ARCHIVEE,
            ]:
                raise ValidationError({
                    "date_limite": (
                        "La date limite ne peut pas être antérieure "
                        "à la date actuelle."
                    )
                })

        if self.experience_requise < 0:
            raise ValidationError({
                "experience_requise": (
                    "L'expérience requise ne peut pas être négative."
                )
            })

    # ------------------------------------------------------------------
    # Sauvegarde
    # ------------------------------------------------------------------

    @transaction.atomic
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        needs_reference = is_new and not self.reference
        if not self.slug:
            self.slug = slugify(self.titre)[:240] + "-" + uuid.uuid4().hex[:12]
        if needs_reference:
            self.reference = f"HJ-{timezone.now().year}-{uuid.uuid4().hex[:16]}"
        if self.date_limite and self.date_limite < timezone.localdate() and self.statut == self.Status.PUBLIEE:
            self.statut = self.Status.EXPIREE
            self.date_expiration = timezone.now()
        super().save(*args, **kwargs)
        if needs_reference:
            self.reference = f"HJ-{timezone.now().year}-{self.pk:05d}"
            type(self).objects.filter(pk=self.pk).update(reference=self.reference)

    # ------------------------------------------------------------------
    # Publication
    # ------------------------------------------------------------------

    def soumettre_moderation(self):
        """
        Soumet l'offre à l'administrateur.
        """

        self.statut = self.Status.EN_ATTENTE
        self.moderation_status = self.ModerationStatus.EN_ATTENTE
        self.motif_rejet = ""
        self.save(
            update_fields=[
                "statut",
                "moderation_status",
                "motif_rejet",
                "updated_at",
            ]
        )

    def publier(self):
        """
        Publie une offre après validation administrative.
        """

        self.statut = self.Status.PUBLIEE
        self.moderation_status = self.ModerationStatus.APPROUVEE

        if not self.date_publication:
            self.date_publication = timezone.now()

        self.save(
            update_fields=[
                "statut",
                "moderation_status",
                "date_publication",
                "updated_at",
            ]
        )

    def rejeter(self, motif=""):
        """
        Rejette une offre.
        """

        self.statut = self.Status.REJETEE
        self.moderation_status = self.ModerationStatus.REJETEE
        self.motif_rejet = motif

        self.save(
            update_fields=[
                "statut",
                "moderation_status",
                "motif_rejet",
                "updated_at",
            ]
        )

    def suspendre(self, motif=""):
        """
        Suspend temporairement une offre.
        """

        self.statut = self.Status.SUSPENDUE
        self.motif_suspension = motif

        self.save(
            update_fields=[
                "statut",
                "motif_suspension",
                "updated_at",
            ]
        )

    def archiver(self):
        """
        Archive l'offre.
        """

        self.statut = self.Status.ARCHIVEE
        self.date_archivage = timezone.now()

        self.save(
            update_fields=[
                "statut",
                "date_archivage",
                "updated_at",
            ]
        )

    def reactiver(self):
        """
        Réactive une offre expirée ou archivée.
        """

        if self.date_limite < timezone.localdate():
            raise ValidationError(
                "Impossible de réactiver une offre dont la date limite est dépassée."
            )

        self.statut = self.Status.PUBLIEE
        self.date_expiration = None
        self.date_archivage = None

        if not self.date_publication:
            self.date_publication = timezone.now()

        self.save(
            update_fields=[
                "statut",
                "date_expiration",
                "date_archivage",
                "date_publication",
                "updated_at",
            ]
        )

    # ------------------------------------------------------------------
    # Expiration
    # ------------------------------------------------------------------

    def verifier_expiration(self):
        """
        Vérifie si l'offre doit passer automatiquement à expirée.
        """

        if (
            self.date_limite
            and self.date_limite < timezone.localdate()
            and self.statut == self.Status.PUBLIEE
        ):
            self.statut = self.Status.EXPIREE
            self.date_expiration = timezone.now()

            self.save(
                update_fields=[
                    "statut",
                    "date_expiration",
                    "updated_at",
                ]
            )

        return self.statut == self.Status.EXPIREE

    # ------------------------------------------------------------------
    # Utilitaires
    # ------------------------------------------------------------------

    @property
    def est_publiee(self):
        return self.statut == self.Status.PUBLIEE

    @property
    def est_expiree(self):
        return (
            self.statut == self.Status.EXPIREE
            or (
                self.date_limite
                and self.date_limite < timezone.localdate()
            )
        )

    @property
    def est_en_attente_moderation(self):
        return (
            self.moderation_status
            == self.ModerationStatus.EN_ATTENTE
        )

    @property
    def entreprise_verifiee(self):
        return (
            self.entreprise.verification_status == "VERIFIED"
        )

    @property
    def jours_restants(self):
        if not self.date_limite:
            return None

        difference = self.date_limite - timezone.localdate()
        return max(difference.days, 0)