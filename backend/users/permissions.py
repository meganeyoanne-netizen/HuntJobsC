from rest_framework.permissions import BasePermission


# ============================================================
# PERMISSION : CANDIDAT
# ============================================================

class IsCandidate(BasePermission):
    """
    Autorise uniquement les utilisateurs
    ayant le rôle CANDIDAT.
    """

    message = (
        "Cette action est réservée aux candidats."
    )

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_candidate
        )


# ============================================================
# PERMISSION : RECRUTEUR
# ============================================================

class IsRecruiter(BasePermission):
    """
    Autorise uniquement les utilisateurs
    ayant le rôle RECRUTEUR.
    """

    message = (
        "Cette action est réservée aux recruteurs."
    )

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_recruiter
        )


# ============================================================
# PERMISSION : ADMINISTRATEUR
# ============================================================

class IsAdmin(BasePermission):
    """
    Autorise uniquement les administrateurs
    HuntJobs.

    Un superutilisateur Django est également
    considéré comme administrateur.
    """

    message = (
        "Cette action est réservée aux administrateurs."
    )

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_admin_role
                or request.user.is_superuser
            )
        )


# ============================================================
# PERMISSION : PROPRIETAIRE
# ============================================================

class IsOwner(BasePermission):
    """
    Vérifie qu'un utilisateur accède uniquement
    à ses propres données.

    Cette permission sera principalement utilisée
    avec les objets directement liés au User.
    """

    message = (
        "Vous n'avez pas l'autorisation "
        "d'accéder à cette ressource."
    )

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):

        # Objet User
        if hasattr(obj, "id") and obj == request.user:
            return True

        # Objet ayant un attribut user
        if hasattr(obj, "user"):
            return obj.user == request.user

        return False


# ============================================================
# PERMISSION : PROPRIETAIRE CANDIDAT
# ============================================================

class IsCandidateOwner(BasePermission):
    """
    Vérifie que le candidat connecté est bien
    propriétaire de la ressource demandée.

    Compatible avec :
    - ProfilCandidat
    - CV
    - Document
    - autres objets liés à un candidat
    """

    message = (
        "Vous ne pouvez accéder qu'à vos propres données."
    )

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):

        # ProfilCandidat
        if hasattr(obj, "user"):
            return obj.user == request.user

        # CV / Document
        if hasattr(obj, "candidat"):
            return (
                obj.candidat.user
                == request.user
            )

        return False


# ============================================================
# PERMISSION : PROPRIETAIRE RECRUTEUR
# ============================================================

class IsRecruiterOwner(BasePermission):
    """
    Vérifie que le recruteur connecté est bien
    propriétaire de la ressource.

    Compatible avec :
    - ProfilRecruteur
    - Entreprise
    - futures offres
    - futurs entretiens
    """

    message = (
        "Vous ne pouvez accéder qu'à vos propres données."
    )

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):

        # ProfilRecruteur
        if hasattr(obj, "user"):
            return obj.user == request.user

        # Entreprise
        if hasattr(obj, "profil_recruteur"):
            return (
                obj.profil_recruteur.user
                == request.user
            )

        # Futurs objets liés au recruteur
        if hasattr(obj, "recruteur"):
            recruteur = obj.recruteur

            # recruteur peut être directement User
            if recruteur == request.user:
                return True

            # recruteur peut être ProfilRecruteur
            if hasattr(recruteur, "user"):
                return (
                    recruteur.user
                    == request.user
                )

        return False


# ============================================================
# PERMISSION : ADMIN OU PROPRIETAIRE
# ============================================================

class IsAdminOrOwner(BasePermission):
    """
    Autorise :

    - l'administrateur ;
    - ou le propriétaire de la ressource.
    """

    message = (
        "Vous n'avez pas l'autorisation "
        "d'effectuer cette action."
    )

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):

        # Administrateur
        if (
            request.user.is_authenticated
            and (
                request.user.is_admin_role
                or request.user.is_superuser
            )
        ):
            return True

        # Objet directement lié au User
        if hasattr(obj, "user"):
            return obj.user == request.user

        # Objet lié au candidat
        if hasattr(obj, "candidat"):
            return (
                obj.candidat.user
                == request.user
            )

        # Objet lié au recruteur
        if hasattr(obj, "profil_recruteur"):
            return (
                obj.profil_recruteur.user
                == request.user
            )

        return False


# ============================================================
# PERMISSION : ENTREPRISE ACTIVE
# ============================================================

class IsActiveRecruiterCompany(BasePermission):
    """
    Vérifie que :

    - l'utilisateur est recruteur ;
    - son profil recruteur existe ;
    - son entreprise existe ;
    - son entreprise n'est pas suspendue.

    Cette permission sera utilisée notamment
    pour publier ou gérer des offres.
    """

    message = (
        "Votre entreprise n'est pas autorisée "
        "à effectuer cette action."
    )

    def has_permission(
        self,
        request,
        view
    ):

        user = request.user

        if (
            not user
            or not user.is_authenticated
            or not user.is_recruiter
        ):
            return False

        try:

            entreprise = (
                user.profil_recruteur.entreprise
            )

            return (
                entreprise.is_active
                and not entreprise.is_suspended
            )

        except Exception:
            return False


# ============================================================
# PERMISSION : ENTREPRISE VERIFIEE
# ============================================================

class IsVerifiedRecruiterCompany(BasePermission):
    """
    Vérifie que l'entreprise du recruteur
    est validée par HuntJobs.

    Attention :

    HuntJobs permet à un recruteur non vérifié
    de publier des offres.

    Cette permission ne doit donc PAS être
    utilisée pour empêcher la publication
    d'offres.

    Elle sera utilisée uniquement pour les
    fonctionnalités nécessitant explicitement
    une entreprise vérifiée.
    """

    message = (
        "Cette fonctionnalité nécessite "
        "une entreprise vérifiée."
    )

    def has_permission(
        self,
        request,
        view
    ):

        user = request.user

        if (
            not user
            or not user.is_authenticated
            or not user.is_recruiter
        ):
            return False

        try:

            entreprise = (
                user.profil_recruteur.entreprise
            )

            return (
                entreprise.verification_status
                == "VERIFIED"
                and entreprise.is_active
                and not entreprise.is_suspended
            )

        except Exception:
            return False