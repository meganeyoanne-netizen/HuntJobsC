from django.contrib import admin
from django.utils.html import format_html

from .models import Offre


@admin.register(Offre)
class OffreAdmin(admin.ModelAdmin):

    # ---------------------------------------------------------
    # Affichage de la liste
    # ---------------------------------------------------------

    list_display = (
        "titre",
        "reference",
        "entreprise_display",
        "recruteur_display",
        "type_contrat",
        "statut_badge",
        "moderation_badge",
        "date_limite",
        "nombre_candidatures",
        "created_at",
    )

    # ---------------------------------------------------------
    # Filtres
    # ---------------------------------------------------------

    list_filter = (
        "statut",
        "moderation_status",
        "type_contrat",
        "mode_travail",
        "niveau_experience",
        "niveau_etudes",
        "salaire_confidentiel",
        "created_at",
        "date_limite",
    )

    # ---------------------------------------------------------
    # Recherche
    # ---------------------------------------------------------

    search_fields = (
        "titre",
        "reference",
        "description",
        "localisation",
        "diplome_requis",
        "entreprise__nom",
        "recruteur__email",
        "recruteur__first_name",
        "recruteur__last_name",
    )

    # ---------------------------------------------------------
    # Organisation des formulaires
    # ---------------------------------------------------------

    fieldsets = (
        (
            "Identification",
            {
                "fields": (
                    "titre",
                    "reference",
                    "slug",
                    "entreprise",
                    "recruteur",
                )
            },
        ),
        (
            "Description",
            {
                "fields": (
                    "description",
                    "missions",
                    "profil_recherche",
                )
            },
        ),
        (
            "Conditions du poste",
            {
                "fields": (
                    "type_contrat",
                    "niveau_experience",
                    "experience_requise",
                    "niveau_etudes",
                    "diplome_requis",
                )
            },
        ),
        (
            "Compétences",
            {
                "fields": (
                    "competences",
                    "competences_validees",
                )
            },
        ),
        (
            "Localisation",
            {
                "fields": (
                    "localisation",
                    "mode_travail",
                )
            },
        ),
        (
            "Rémunération",
            {
                "fields": (
                    "salaire_min",
                    "salaire_max",
                    "devise",
                    "salaire_confidentiel",
                )
            },
        ),
        (
            "Avantages et média",
            {
                "fields": (
                    "avantages",
                    "flyer",
                )
            },
        ),
        (
            "Publication",
            {
                "fields": (
                    "date_publication",
                    "date_limite",
                    "date_expiration",
                    "date_archivage",
                )
            },
        ),
        (
            "Modération",
            {
                "fields": (
                    "statut",
                    "moderation_status",
                    "motif_rejet",
                    "motif_suspension",
                )
            },
        ),
        (
            "Statistiques",
            {
                "fields": (
                    "nombre_vues",
                    "nombre_candidatures",
                )
            },
        ),
        (
            "Métadonnées",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    readonly_fields = (
        "reference",
        "slug",
        "created_at",
        "updated_at",
        "date_publication",
        "date_expiration",
        "date_archivage",
        "nombre_vues",
        "nombre_candidatures",
    )

    # ---------------------------------------------------------
    # Optimisation des relations
    # ---------------------------------------------------------

    autocomplete_fields = (
        "entreprise",
        "recruteur",
    )

    # ---------------------------------------------------------
    # Actions administrateur
    # ---------------------------------------------------------

    actions = (
        "publier_offres",
        "rejeter_offres",
        "suspendre_offres",
        "archiver_offres",
    )

    # ---------------------------------------------------------
    # Affichage entreprise
    # ---------------------------------------------------------

    @admin.display(
        description="Entreprise",
        ordering="entreprise__nom",
    )
    def entreprise_display(self, obj):
        if obj.entreprise:
            return obj.entreprise.nom

        return "—"

    # ---------------------------------------------------------
    # Affichage recruteur
    # ---------------------------------------------------------

    @admin.display(
        description="Recruteur",
        ordering="recruteur__email",
    )
    def recruteur_display(self, obj):
        if not obj.recruteur:
            return "—"

        full_name = obj.recruteur.get_full_name()

        if full_name:
            return f"{full_name} ({obj.recruteur.email})"

        return obj.recruteur.email

    # ---------------------------------------------------------
    # Badge statut
    # ---------------------------------------------------------

    @admin.display(
        description="Statut",
        ordering="statut",
    )
    def statut_badge(self, obj):

        colors = {
            Offre.Status.BROUILLON: "#64748b",
            Offre.Status.EN_ATTENTE: "#f59e0b",
            Offre.Status.PUBLIEE: "#10b981",
            Offre.Status.REJETEE: "#ef4444",
            Offre.Status.SUSPENDUE: "#f97316",
            Offre.Status.EXPIREE: "#8b5cf6",
            Offre.Status.ARCHIVEE: "#475569",
        }

        color = colors.get(obj.statut, "#64748b")

        return format_html(
            '<span style="'
            'background:{};'
            'color:white;'
            'padding:4px 9px;'
            'border-radius:999px;'
            'font-size:12px;'
            'font-weight:600;'
            'display:inline-block;'
            '">{}</span>',
            color,
            obj.get_statut_display(),
        )

    # ---------------------------------------------------------
    # Badge modération
    # ---------------------------------------------------------

    @admin.display(
        description="Modération",
        ordering="moderation_status",
    )
    def moderation_badge(self, obj):

        colors = {
            Offre.ModerationStatus.NON_SOUMISE: "#64748b",
            Offre.ModerationStatus.EN_ATTENTE: "#f59e0b",
            Offre.ModerationStatus.APPROUVEE: "#10b981",
            Offre.ModerationStatus.REJETEE: "#ef4444",
        }

        color = colors.get(
            obj.moderation_status,
            "#64748b",
        )

        return format_html(
            '<span style="'
            'background:{};'
            'color:white;'
            'padding:4px 9px;'
            'border-radius:999px;'
            'font-size:12px;'
            'font-weight:600;'
            'display:inline-block;'
            '">{}</span>',
            color,
            obj.get_moderation_status_display(),
        )

    # ---------------------------------------------------------
    # Action : publier
    # ---------------------------------------------------------

    @admin.action(description="Publier les offres sélectionnées")
    def publier_offres(self, request, queryset):

        count = 0

        for offre in queryset:

            if (
                offre.moderation_status
                == Offre.ModerationStatus.APPROUVEE
            ):
                offre.publier()
                count += 1

        self.message_user(
            request,
            f"{count} offre(s) publiée(s).",
        )

    # ---------------------------------------------------------
    # Action : rejeter
    # ---------------------------------------------------------

    @admin.action(description="Rejeter les offres sélectionnées")
    def rejeter_offres(self, request, queryset):

        count = 0

        for offre in queryset:

            offre.rejeter(
                "Offre rejetée depuis l'administration."
            )

            count += 1

        self.message_user(
            request,
            f"{count} offre(s) rejetée(s).",
        )

    # ---------------------------------------------------------
    # Action : suspendre
    # ---------------------------------------------------------

    @admin.action(description="Suspendre les offres sélectionnées")
    def suspendre_offres(self, request, queryset):

        count = 0

        for offre in queryset:

            offre.suspendre(
                "Offre suspendue depuis l'administration."
            )

            count += 1

        self.message_user(
            request,
            f"{count} offre(s) suspendue(s).",
        )

    # ---------------------------------------------------------
    # Action : archiver
    # ---------------------------------------------------------

    @admin.action(description="Archiver les offres sélectionnées")
    def archiver_offres(self, request, queryset):

        count = 0

        for offre in queryset:

            offre.archiver()
            count += 1

        self.message_user(
            request,
            f"{count} offre(s) archivée(s).",
        )