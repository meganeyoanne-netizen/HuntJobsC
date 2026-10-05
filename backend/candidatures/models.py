from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class Candidature(models.Model):
    """
    Représente la candidature d'un candidat à une offre d'emploi.
    """

    # =========================================================
    # STATUTS
    # =========================================================

    class Status(models.TextChoices):
        RECUE = "RECUE", "Candidature reçue"
        PRESELECTION = "PRESELECTION", "Présélection"
        ENTRETIEN = "ENTRETIEN", "Entretien"
        EVALUATION = "EVALUATION", "Évaluation"
        RETENU = "RETENU", "Retenu"
        REFUSE = "REFUSE", "Refusé"
        RETIREE = "RETIREE", "Retirée"

    # =========================================================
    # SOURCES DE CANDIDATURE
    # =========================================================

    class Source(models.TextChoices):
        PLATEFORME = "PLATEFORME", "Plateforme"
        ALERTE = "ALERTE", "Alerte emploi"
        RECOMMANDATION = "RECOMMANDATION", "Recommandation"
        AUTRE = "AUTRE", "Autre"

    # =========================================================
    # RELATIONS PRINCIPALES
    # =========================================================

    candidat = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="candidatures",
        limit_choices_to={"role": "CANDIDAT"},
        verbose_name="Candidat",
    )

    offre = models.ForeignKey(
        "offres.Offre",
        on_delete=models.CASCADE,
        related_name="candidatures",
        verbose_name="Offre",
    )

    cv = models.ForeignKey(
        "users.CV",
        on_delete=models.PROTECT,
        related_name="candidatures",
        verbose_name="CV utilisé",
    )

    # =========================================================
    # INFORMATIONS DE CANDIDATURE
    # =========================================================

    lettre_motivation = models.TextField(
        blank=True,
        default="",
        verbose_name="Lettre de motivation",
    )

    message_candidat = models.TextField(
        blank=True,
        default="",
        verbose_name="Message du candidat",
    )

    source = models.CharField(
        max_length=30,
        choices=Source.choices,
        default=Source.PLATEFORME,
        verbose_name="Source",
    )

    # =========================================================
    # GESTION DU STATUT
    # =========================================================

    statut = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.RECUE,
        verbose_name="Statut",
    )

    statut_precedent = models.CharField(
        max_length=30,
        choices=Status.choices,
        blank=True,
        null=True,
        verbose_name="Statut précédent",
    )

    motif_refus = models.TextField(
        blank=True,
        default="",
        verbose_name="Motif du refus",
    )

    motif_retrait = models.TextField(
        blank=True,
        default="",
        verbose_name="Motif du retrait",
    )

    # =========================================================
    # ATS / COMPATIBILITÉ
    # =========================================================

    score_compatibilite = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Score de compatibilité",
        help_text="Score ATS compris entre 0 et 100.",
    )

    analyse_ats = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Analyse ATS",
        help_text="Résultat détaillé de l'analyse ATS.",
    )

    score_ats_calcule = models.BooleanField(
        default=False,
        verbose_name="Score ATS calculé",
    )

    date_analyse_ats = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'analyse ATS",
    )

    # =========================================================
    # NOTES INTERNES DU RECRUTEUR
    # =========================================================

    note_interne = models.TextField(
        blank=True,
        default="",
        verbose_name="Note interne",
        help_text="Note visible uniquement par le recruteur.",
    )

    # =========================================================
    # DATES DU PROCESSUS
    # =========================================================

    date_candidature = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de candidature",
    )

    date_modification = models.DateTimeField(
        auto_now=True,
        verbose_name="Date de modification",
    )

    date_preselection = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de présélection",
    )

    date_entretien = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de l'entretien",
    )

    date_evaluation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de l'évaluation",
    )

    date_decision = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de décision",
    )

    date_retrait = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de retrait",
    )

    # =========================================================
    # MÉTADONNÉES
    # =========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # =========================================================
    # META
    # =========================================================

    class Meta:
        db_table = "candidatures"

        ordering = [
            "-date_candidature"
        ]

        verbose_name = "Candidature"
        verbose_name_plural = "Candidatures"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "candidat",
                    "offre",
                ],
                name="unique_candidature_candidat_offre",
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "candidat",
                    "statut",
                ],
                name="cand_candidat_statut_idx",
            ),

            models.Index(
                fields=[
                    "offre",
                    "statut",
                ],
                name="cand_offre_statut_idx",
            ),

            models.Index(
                fields=[
                    "offre",
                    "-date_candidature",
                ],
                name="cand_offre_date_idx",
            ),

            models.Index(
                fields=[
                    "score_compatibilite",
                ],
                name="cand_score_ats_idx",
            ),
        ]

    # =========================================================
    # REPRESENTATION
    # =========================================================

    def __str__(self):
        return f"{self.candidat} → {self.offre}"

    # =========================================================
    # VALIDATION
    # =========================================================

    def clean(self):
        """
        Vérifications métier de la candidature.
        """

        errors = {}

        # -----------------------------------------------------
        # Vérification du rôle du candidat
        # -----------------------------------------------------

        if self.candidat_id:

            if getattr(self.candidat, "role", None) != "CANDIDAT":

                errors["candidat"] = (
                    "Seul un utilisateur ayant le rôle "
                    "Candidat peut déposer une candidature."
                )

        # -----------------------------------------------------
        # Vérification de l'appartenance du CV
        # -----------------------------------------------------

        if self.cv_id and self.candidat_id:

            if self.cv.candidat.user_id != self.candidat_id:

                errors["cv"] = (
                    "Le CV sélectionné n'appartient pas "
                    "au candidat."
                )

        # -----------------------------------------------------
        # Vérification du score ATS
        # -----------------------------------------------------

        if self.score_compatibilite is not None:

            if (
                self.score_compatibilite < 0
                or self.score_compatibilite > 100
            ):
                errors["score_compatibilite"] = (
                    "Le score ATS doit être compris "
                    "entre 0 et 100."
                )

        # -----------------------------------------------------
        # Retrait
        # -----------------------------------------------------

        if self.statut == self.Status.RETIREE:

            if not self.date_retrait:
                self.date_retrait = timezone.now()

        # -----------------------------------------------------
        # Décision finale
        # -----------------------------------------------------

        if self.statut in [
            self.Status.RETENU,
            self.Status.REFUSE,
        ]:

            if not self.date_decision:
                self.date_decision = timezone.now()

        # -----------------------------------------------------
        # Retour des erreurs
        # -----------------------------------------------------

        if errors:
            raise ValidationError(errors)

    # =========================================================
    # CHANGEMENT DE STATUT
    # =========================================================

    def changer_statut(
        self,
        nouveau_statut,
        motif=None,
    ):
        """
        Permet au recruteur de faire évoluer
        la candidature dans le processus de recrutement.
        """

        statuts_valides = dict(
            self.Status.choices
        )

        if nouveau_statut not in statuts_valides:

            raise ValidationError(
                "Le statut fourni n'est pas valide."
            )

        ancien_statut = self.statut

        # Aucun changement
        if ancien_statut == nouveau_statut:
            return

        maintenant = timezone.now()

        # -----------------------------------------------------
        # Sauvegarde de l'ancien statut
        # -----------------------------------------------------

        self.statut_precedent = ancien_statut
        self.statut = nouveau_statut

        # -----------------------------------------------------
        # Présélection
        # -----------------------------------------------------

        if nouveau_statut == self.Status.PRESELECTION:

            self.date_preselection = maintenant

        # -----------------------------------------------------
        # Entretien
        # -----------------------------------------------------

        elif nouveau_statut == self.Status.ENTRETIEN:

            self.date_entretien = maintenant

        # -----------------------------------------------------
        # Évaluation
        # -----------------------------------------------------

        elif nouveau_statut == self.Status.EVALUATION:

            self.date_evaluation = maintenant

        # -----------------------------------------------------
        # Retenu / Refusé
        # -----------------------------------------------------

        elif nouveau_statut in [
            self.Status.RETENU,
            self.Status.REFUSE,
        ]:

            self.date_decision = maintenant

            if (
                nouveau_statut == self.Status.REFUSE
                and motif
            ):
                self.motif_refus = motif

        # -----------------------------------------------------
        # Retirée
        # -----------------------------------------------------

        elif nouveau_statut == self.Status.RETIREE:

            self.date_retrait = maintenant

            if motif:
                self.motif_retrait = motif

        self.save()

    # =========================================================
    # RETIRER UNE CANDIDATURE
    # =========================================================

    def retirer(self, motif=""):
        """
        Permet au candidat de retirer sa candidature.
        """

        statuts_finaux = [
            self.Status.RETENU,
            self.Status.REFUSE,
            self.Status.RETIREE,
        ]

        if self.statut in statuts_finaux:

            raise ValidationError(
                "Cette candidature ne peut plus être retirée."
            )

        self.statut_precedent = self.statut

        self.statut = self.Status.RETIREE

        self.motif_retrait = motif

        self.date_retrait = timezone.now()

        self.save()

    # =========================================================
    # ENREGISTRER LE SCORE ATS
    # =========================================================

    def calculer_score_ats(
        self,
        score,
        analyse=None,
    ):
        """
        Enregistre le score produit par le moteur ATS/IA.

        Le recruteur ne doit pas pouvoir modifier
        manuellement ce score.
        """

        if score is None:

            raise ValidationError(
                "Un score de compatibilité est requis."
            )

        try:
            score = float(score)

        except (TypeError, ValueError):

            raise ValidationError(
                "Le score ATS doit être un nombre."
            )

        if score < 0 or score > 100:

            raise ValidationError(
                "Le score ATS doit être compris "
                "entre 0 et 100."
            )

        self.score_compatibilite = round(
            score,
            2,
        )

        self.score_ats_calcule = True

        self.date_analyse_ats = timezone.now()

        if analyse is not None:
            self.analyse_ats = analyse

        self.save(
            update_fields=[
                "score_compatibilite",
                "score_ats_calcule",
                "date_analyse_ats",
                "analyse_ats",
                "updated_at",
            ]
        )

    # =========================================================
    # PROPRIÉTÉS
    # =========================================================

    @property
    def est_active(self):
        """
        Indique si la candidature est encore
        dans le processus de recrutement.
        """

        return self.statut not in [
            self.Status.RETENU,
            self.Status.REFUSE,
            self.Status.RETIREE,
        ]

    @property
    def est_terminee(self):
        """
        Indique si le processus est terminé.
        """

        return self.statut in [
            self.Status.RETENU,
            self.Status.REFUSE,
            self.Status.RETIREE,
        ]

    @property
    def est_retenu(self):
        return self.statut == self.Status.RETENU

    @property
    def est_refuse(self):
        return self.statut == self.Status.REFUSE

    @property
    def est_retiree(self):
        return self.statut == self.Status.RETIREE

    @property
    def statut_label(self):
        """
        Retourne le libellé français du statut.
        """

        return dict(
            self.Status.choices
        ).get(
            self.statut,
            self.statut,
        )

    @property
    def progression(self):
        """
        Retourne le pourcentage de progression
        affiché au candidat.
        """

        progression = {
            self.Status.RECUE: 20,
            self.Status.PRESELECTION: 40,
            self.Status.ENTRETIEN: 60,
            self.Status.EVALUATION: 80,
            self.Status.RETENU: 100,
            self.Status.REFUSE: 100,
            self.Status.RETIREE: 0,
        }

        return progression.get(
            self.statut,
            0,
        )