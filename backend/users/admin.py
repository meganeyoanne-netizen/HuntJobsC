from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    User,
    ProfilCandidat,
    ProfilRecruteur,
    Entreprise,
    CV,
    Document,
)


# ============================================================
# UTILISATEUR PERSONNALISÉ
# ============================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):

    list_display = (
        "email",
        "username",
        "first_name",
        "last_name",
        "role",
        "is_suspended",
        "is_active",
        "is_staff",
        "created_at",
    )

    list_filter = (
        "role",
        "is_suspended",
        "is_active",
        "is_staff",
        "is_superuser",
    )

    search_fields = (
        "email",
        "username",
        "first_name",
        "last_name",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "suspension_date",
    )

    fieldsets = (
        (
            "Informations de connexion",
            {
                "fields": (
                    "email",
                    "username",
                    "password",
                )
            },
        ),

        (
            "Informations personnelles",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "telephone",
                    "avatar",
                )
            },
        ),

        (
            "Rôle",
            {
                "fields": (
                    "role",
                )
            },
        ),

        (
            "Suspension",
            {
                "fields": (
                    "is_suspended",
                    "suspension_reason",
                    "suspension_date",
                )
            },
        ),

        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),

        (
            "Dates",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            "Création d'un utilisateur",
            {
                "classes": (
                    "wide",
                ),
                "fields": (
                    "email",
                    "username",
                    "first_name",
                    "last_name",
                    "role",
                    "telephone",
                    "password1",
                    "password2",
                ),
            },
        ),
    )


# ============================================================
# PROFIL CANDIDAT
# ============================================================

@admin.register(ProfilCandidat)
class ProfilCandidatAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "titre_professionnel",
        "localisation",
        "annees_experience",
        "profile_completion",
        "is_profile_public",
        "updated_at",
    )

    list_filter = (
        "is_profile_public",
        "disponibilite",
    )

    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "titre_professionnel",
        "localisation",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Utilisateur",
            {
                "fields": (
                    "user",
                )
            },
        ),

        (
            "Informations professionnelles",
            {
                "fields": (
                    "titre_professionnel",
                    "bio",
                    "localisation",
                    "disponibilite",
                    "annees_experience",
                )
            },
        ),

        (
            "Informations personnelles",
            {
                "fields": (
                    "date_naissance",
                )
            },
        ),

        (
            "Compétences et parcours",
            {
                "fields": (
                    "competences",
                    "formations",
                    "experiences",
                    "langues",
                )
            },
        ),

        (
            "Liens professionnels",
            {
                "fields": (
                    "linkedin_url",
                    "github_url",
                    "portfolio_url",
                )
            },
        ),

        (
            "Profil",
            {
                "fields": (
                    "profile_completion",
                    "is_profile_public",
                )
            },
        ),

        (
            "Dates",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# PROFIL RECRUTEUR
# ============================================================

@admin.register(ProfilRecruteur)
class ProfilRecruteurAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "poste",
        "fonction",
        "telephone_professionnel",
        "updated_at",
    )

    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "poste",
        "fonction",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Utilisateur",
            {
                "fields": (
                    "user",
                )
            },
        ),

        (
            "Informations professionnelles",
            {
                "fields": (
                    "poste",
                    "fonction",
                    "telephone_professionnel",
                )
            },
        ),

        (
            "Dates",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# ENTREPRISE
# ============================================================

@admin.register(Entreprise)
class EntrepriseAdmin(admin.ModelAdmin):

    list_display = (
        "nom",
        "profil_recruteur",
        "email_professionnel",
        "nui",
        "verification_status",
        "is_active",
        "is_suspended",
        "created_at",
    )

    list_filter = (
        "verification_status",
        "is_active",
        "is_suspended",
        "email_professionnel_locked",
        "nui_locked",
    )

    search_fields = (
        "nom",
        "email_professionnel",
        "nui",
        "profil_recruteur__user__email",
    )

    readonly_fields = (
        "verification_requested_at",
        "verified_at",
        "suspension_date",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Recruteur",
            {
                "fields": (
                    "profil_recruteur",
                )
            },
        ),

        (
            "Informations générales",
            {
                "fields": (
                    "nom",
                    "secteur_activite",
                    "taille",
                    "description",
                    "logo",
                )
            },
        ),

        (
            "Coordonnées",
            {
                "fields": (
                    "email_professionnel",
                    "telephone",
                    "site_web",
                    "linkedin_url",
                    "localisation",
                    "adresse",
                )
            },
        ),

        (
            "Informations légales",
            {
                "fields": (
                    "nui",
                    "document_immatriculation",
                    "preuve_activite",
                )
            },
        ),

        (
            "Vérification",
            {
                "fields": (
                    "verification_status",
                    "verification_requested_at",
                    "verified_at",
                    "verification_comment",
                )
            },
        ),

        (
            "Verrouillage des informations",
            {
                "fields": (
                    "email_professionnel_locked",
                    "nui_locked",
                    "email_modification_allowed",
                    "nui_modification_allowed",
                    "modification_request_reason",
                    "modification_request_date",
                )
            },
        ),

        (
            "Statut de l'entreprise",
            {
                "fields": (
                    "is_active",
                    "is_suspended",
                    "suspension_reason",
                    "suspension_date",
                )
            },
        ),

        (
            "Dates",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# CV
# ============================================================

@admin.register(CV)
class CVAdmin(admin.ModelAdmin):

    list_display = (
        "titre",
        "candidat",
        "is_primary",
        "is_generated",
        "created_at",
    )

    list_filter = (
        "is_primary",
        "is_generated",
    )

    search_fields = (
        "titre",
        "candidat__user__email",
        "candidat__user__first_name",
        "candidat__user__last_name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Candidat",
            {
                "fields": (
                    "candidat",
                )
            },
        ),

        (
            "Informations du CV",
            {
                "fields": (
                    "titre",
                    "fichier",
                    "contenu_en_ligne",
                    "is_primary",
                )
            },
        ),

        (
            "Génération HuntJobs",
            {
                "fields": (
                    "is_generated",
                    "template_name",
                )
            },
        ),

        (
            "Dates",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# DOCUMENTS
# ============================================================

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):

    list_display = (
        "titre",
        "candidat",
        "document_type",
        "is_generated",
        "created_at",
    )

    list_filter = (
        "document_type",
        "is_generated",
    )

    search_fields = (
        "titre",
        "candidat__user__email",
        "candidat__user__first_name",
        "candidat__user__last_name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Candidat",
            {
                "fields": (
                    "candidat",
                )
            },
        ),

        (
            "Document",
            {
                "fields": (
                    "document_type",
                    "titre",
                    "fichier",
                    "is_generated",
                )
            },
        ),

        (
            "Dates",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )
