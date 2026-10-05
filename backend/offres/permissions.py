from rest_framework.permissions import BasePermission


class IsRecruiter(BasePermission):
    """
    Autorise uniquement les utilisateurs ayant le rôle recruteur.
    """

    message = "Seuls les recruteurs peuvent effectuer cette action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_recruiter
            and not request.user.is_suspended
        )


class IsAdmin(BasePermission):
    """
    Autorise uniquement les administrateurs HuntJobs.
    """

    message = "Cette action est réservée aux administrateurs."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_admin_role
                or request.user.is_superuser
            )
        )


class IsCandidate(BasePermission):
    """
    Autorise uniquement les candidats.
    """

    message = "Cette action est réservée aux candidats."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_candidate
            and not request.user.is_suspended
        )


class IsRecruiterOwner(BasePermission):
    """
    Vérifie que le recruteur est bien propriétaire de l'offre.
    """

    message = "Vous ne pouvez pas gérer cette offre."

    def has_object_permission(self, request, view, obj):

        if not (
            request.user
            and request.user.is_authenticated
            and request.user.is_recruiter
        ):
            return False

        if request.user.is_suspended:
            return False

        return obj.recruteur_id == request.user.id


class IsOfferOwnerOrAdmin(BasePermission):
    """
    Autorise le propriétaire de l'offre ou un administrateur.
    """

    message = "Vous n'avez pas les droits nécessaires."

    def has_object_permission(self, request, view, obj):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser or user.is_admin_role:
            return True

        if user.is_recruiter and not user.is_suspended:
            return obj.recruteur_id == user.id

        return False


class CanViewOffer(BasePermission):
    """
    Permission de consultation d'une offre.

    Les offres publiées sont accessibles aux utilisateurs.
    Un recruteur peut également consulter ses propres offres
    même lorsqu'elles sont encore en brouillon ou en modération.
    Les administrateurs peuvent tout consulter.
    """

    def has_object_permission(self, request, view, obj):

        user = request.user

        # Administrateur
        if (
            user
            and user.is_authenticated
            and (
                user.is_superuser
                or user.is_admin_role
            )
        ):
            return True

        # Propriétaire recruteur
        if (
            user
            and user.is_authenticated
            and user.is_recruiter
            and obj.recruteur_id == user.id
        ):
            return not user.is_suspended

        # Offre publiée pour les autres utilisateurs
        return obj.statut == "PUBLIEE"


class CanCreateOffer(BasePermission):
    """
    Un recruteur peut créer une offre même si son entreprise
    n'est pas encore vérifiée.

    La vérification de l'entreprise n'est donc PAS une condition
    de création de l'offre.
    """

    message = (
        "Vous devez être connecté en tant que recruteur "
        "actif pour créer une offre."
    )

    def has_permission(self, request, view):

        user = request.user

        return (
            user
            and user.is_authenticated
            and user.is_recruiter
            and not user.is_suspended
        )


class CanModerateOffer(BasePermission):
    """
    Seul l'administrateur peut modérer une offre.
    """

    message = "Seuls les administrateurs peuvent modérer les offres."

    def has_permission(self, request, view):

        user = request.user

        return (
            user
            and user.is_authenticated
            and (
                user.is_admin_role
                or user.is_superuser
            )
        )


class CanManageOffer(BasePermission):
    """
    Gestion d'une offre par son propriétaire ou par l'administrateur.
    """

    message = "Vous ne pouvez pas gérer cette offre."

    def has_object_permission(self, request, view, obj):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Administrateur
        if user.is_superuser or user.is_admin_role:
            return True

        # Recruteur propriétaire
        if (
            user.is_recruiter
            and not user.is_suspended
            and obj.recruteur_id == user.id
        ):
            return True

        return False


class IsPublishedOffer(BasePermission):
    """
    Vérifie qu'une offre est publiée.
    """

    message = "Cette offre n'est pas actuellement publiée."

    def has_object_permission(self, request, view, obj):
        return obj.statut == "PUBLIEE"