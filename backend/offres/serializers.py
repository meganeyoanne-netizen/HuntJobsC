from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from .models import Offre


class OffreListSerializer(serializers.ModelSerializer):
    """
    Serializer léger utilisé pour les listes d'offres.
    """

    entreprise_nom = serializers.CharField(
        source="entreprise.nom",
        read_only=True
    )

    entreprise_logo = serializers.ImageField(
        source="entreprise.logo",
        read_only=True
    )

    entreprise_verifiee = serializers.BooleanField(
        read_only=True
    )

    jours_restants = serializers.IntegerField(
        read_only=True
    )

    type_contrat_label = serializers.CharField(
        source="get_type_contrat_display",
        read_only=True
    )

    mode_travail_label = serializers.CharField(
        source="get_mode_travail_display",
        read_only=True
    )

    niveau_experience_label = serializers.CharField(
        source="get_niveau_experience_display",
        read_only=True
    )

    niveau_etudes_label = serializers.CharField(
        source="get_niveau_etudes_display",
        read_only=True
    )

    statut_label = serializers.CharField(
        source="get_statut_display",
        read_only=True
    )

    class Meta:
        model = Offre

        fields = [
            "id",
            "reference",
            "titre",
            "slug",

            "entreprise",
            "entreprise_nom",
            "entreprise_logo",
            "entreprise_verifiee",

            "type_contrat",
            "type_contrat_label",

            "localisation",
            "mode_travail",
            "mode_travail_label",

            "niveau_experience",
            "niveau_experience_label",

            "niveau_etudes",
            "niveau_etudes_label",

            "experience_requise",
            "diplome_requis",
            "competences",

            "salaire_min",
            "salaire_max",
            "devise",
            "salaire_confidentiel",

            "date_publication",
            "date_limite",
            "jours_restants",

            "statut",
            "statut_label",

            "flyer",

            "nombre_vues",
            "nombre_candidatures",

            "created_at",
        ]


class OffreDetailSerializer(serializers.ModelSerializer):
    """
    Serializer complet utilisé pour afficher une offre.
    """

    entreprise_nom = serializers.CharField(
        source="entreprise.nom",
        read_only=True
    )

    entreprise_logo = serializers.ImageField(
        source="entreprise.logo",
        read_only=True
    )

    entreprise_description = serializers.CharField(
        source="entreprise.description",
        read_only=True
    )

    entreprise_secteur = serializers.CharField(
        source="entreprise.secteur_activite",
        read_only=True
    )

    entreprise_localisation = serializers.CharField(
        source="entreprise.localisation",
        read_only=True
    )

    entreprise_verifiee = serializers.BooleanField(
        read_only=True
    )

    jours_restants = serializers.IntegerField(
        read_only=True
    )

    type_contrat_label = serializers.CharField(
        source="get_type_contrat_display",
        read_only=True
    )

    mode_travail_label = serializers.CharField(
        source="get_mode_travail_display",
        read_only=True
    )

    niveau_experience_label = serializers.CharField(
        source="get_niveau_experience_display",
        read_only=True
    )

    niveau_etudes_label = serializers.CharField(
        source="get_niveau_etudes_display",
        read_only=True
    )

    statut_label = serializers.CharField(
        source="get_statut_display",
        read_only=True
    )

    class Meta:
        model = Offre

        fields = [
            "id",
            "reference",
            "titre",
            "slug",

            "entreprise",
            "entreprise_nom",
            "entreprise_logo",
            "entreprise_description",
            "entreprise_secteur",
            "entreprise_localisation",
            "entreprise_verifiee",

            "description",
            "missions",
            "profil_recherche",

            "type_contrat",
            "type_contrat_label",

            "niveau_experience",
            "niveau_experience_label",

            "experience_requise",

            "niveau_etudes",
            "niveau_etudes_label",

            "diplome_requis",

            "competences",
            "competences_validees",

            "localisation",
            "mode_travail",
            "mode_travail_label",

            "salaire_min",
            "salaire_max",
            "devise",
            "salaire_confidentiel",

            "avantages",

            "flyer",

            "date_publication",
            "date_limite",
            "date_expiration",
            "date_archivage",
            "jours_restants",

            "statut",
            "statut_label",

            "moderation_status",
            "motif_rejet",

            "nombre_vues",
            "nombre_candidatures",

            "created_at",
            "updated_at",
        ]


class OffreCreateSerializer(serializers.ModelSerializer):
    """
    Création d'une offre par un recruteur.

    L'entreprise et le recruteur sont déterminés côté serveur.
    Le frontend ne peut donc pas publier une offre au nom
    d'une autre entreprise.
    """

    def to_internal_value(self, data):
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = data.copy()
        elif isinstance(data, dict):
            data = dict(data)

        if "type_contrat" in data and isinstance(data["type_contrat"], str):
            tc = data["type_contrat"].strip().upper()
            data["type_contrat"] = tc

        mode = data.get("mode_travail") or data.get("teletravail")
        if mode and isinstance(mode, str):
            m = mode.strip().upper()
            if m in ["HYBRIDE", "HYBRID"]:
                data["mode_travail"] = "HYBRIDE"
            elif m in ["DISTANCIEL", "REMOTE"]:
                data["mode_travail"] = "DISTANCIEL"
            elif m in ["SUR_SITE", "ONSITE", "SUR SITE"]:
                data["mode_travail"] = "SUR_SITE"

        if not data.get("localisation") and data.get("lieu"):
            data["localisation"] = data.get("lieu")

        if not data.get("date_limite") and data.get("date_expiration"):
            data["date_limite"] = data.get("date_expiration")

        for field in ["competences", "avantages"]:
            if field in data and isinstance(data[field], str):
                try:
                    import json
                    data[field] = json.loads(data[field])
                except Exception:
                    pass

        return super().to_internal_value(data)

    class Meta:
        model = Offre

        fields = [
            "titre",
            "description",
            "missions",
            "profil_recherche",

            "type_contrat",
            "niveau_experience",
            "experience_requise",

            "niveau_etudes",
            "diplome_requis",

            "competences",

            "localisation",
            "mode_travail",

            "salaire_min",
            "salaire_max",
            "devise",
            "salaire_confidentiel",

            "avantages",

            "flyer",

            "date_limite",
        ]

    def validate_date_limite(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError(
                "La date limite doit être postérieure ou égale à la date actuelle."
            )

        return value

    def validate_salaire_min(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Le salaire minimum ne peut pas être négatif."
            )

        return value

    def validate_salaire_max(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Le salaire maximum ne peut pas être négatif."
            )

        return value

    def validate(self, attrs):
        salaire_min = attrs.get("salaire_min")
        salaire_max = attrs.get("salaire_max")

        if (
            salaire_min is not None
            and salaire_max is not None
            and salaire_min > salaire_max
        ):
            raise serializers.ValidationError({
                "salaire_max": (
                    "Le salaire maximum doit être supérieur "
                    "ou égal au salaire minimum."
                )
            })

        competences = attrs.get("competences", [])
        if isinstance(competences, str):
            try:
                import json
                competences = json.loads(competences)
                attrs["competences"] = competences
            except Exception:
                pass

        if not isinstance(competences, list):
            raise serializers.ValidationError({
                "competences": (
                    "Les compétences doivent être fournies "
                    "sous forme de liste."
                )
            })

        avantages = attrs.get("avantages", [])
        if isinstance(avantages, str):
            try:
                import json
                attrs["avantages"] = json.loads(avantages)
            except Exception:
                pass

        # Inférence automatique du niveau d'études si non spécifié
        if not attrs.get("niveau_etudes"):
            diplome = (attrs.get("diplome_requis") or "").lower()
            if "doctorat" in diplome:
                attrs["niveau_etudes"] = "DOCTORAT"
            elif any(d in diplome for d in ["master", "ingénieur", "ingenieur", "bac+5"]):
                attrs["niveau_etudes"] = "BAC+5"
            elif "bac+4" in diplome:
                attrs["niveau_etudes"] = "BAC+4"
            elif any(d in diplome for d in ["licence", "bac+3"]):
                attrs["niveau_etudes"] = "BAC+3"
            elif any(d in diplome for d in ["bts", "dut", "bac+2"]):
                attrs["niveau_etudes"] = "BAC+2"
            elif any(d in diplome for d in ["bac", "cap", "bep"]):
                attrs["niveau_etudes"] = "BAC"
            elif "probatoire" in diplome:
                attrs["niveau_etudes"] = "PROBATOIRE"
            elif "bepc" in diplome:
                attrs["niveau_etudes"] = "BEPC"
            else:
                attrs["niveau_etudes"] = "AUCUN"

        return attrs


class OffreUpdateSerializer(serializers.ModelSerializer):
    """
    Modification d'une offre par son recruteur.

    Règles importantes :
    - la date limite peut être modifiée ;
    - le diplôme requis déjà défini ne peut pas être supprimé ;
    - les compétences déjà validées ne peuvent pas être supprimées ;
    - les compétences peuvent cependant être ajoutées.
    """

    def to_internal_value(self, data):
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = data.copy()
        elif isinstance(data, dict):
            data = dict(data)

        if "type_contrat" in data and isinstance(data["type_contrat"], str):
            tc = data["type_contrat"].strip().upper()
            data["type_contrat"] = tc

        mode = data.get("mode_travail") or data.get("teletravail")
        if mode and isinstance(mode, str):
            m = mode.strip().upper()
            if m in ["HYBRIDE", "HYBRID"]:
                data["mode_travail"] = "HYBRIDE"
            elif m in ["DISTANCIEL", "REMOTE"]:
                data["mode_travail"] = "DISTANCIEL"
            elif m in ["SUR_SITE", "ONSITE", "SUR SITE"]:
                data["mode_travail"] = "SUR_SITE"

        if not data.get("localisation") and data.get("lieu"):
            data["localisation"] = data.get("lieu")

        if not data.get("date_limite") and data.get("date_expiration"):
            data["date_limite"] = data.get("date_expiration")

        for field in ["competences", "avantages"]:
            if field in data and isinstance(data[field], str):
                try:
                    import json
                    data[field] = json.loads(data[field])
                except Exception:
                    pass

        return super().to_internal_value(data)

    class Meta:
        model = Offre

        fields = [
            "titre",
            "description",
            "missions",
            "profil_recherche",

            "type_contrat",
            "niveau_experience",
            "experience_requise",

            "niveau_etudes",
            "diplome_requis",

            "competences",

            "localisation",
            "mode_travail",

            "salaire_min",
            "salaire_max",
            "devise",
            "salaire_confidentiel",

            "avantages",

            "flyer",

            "date_limite",
        ]

    def validate_date_limite(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError(
                "La date limite doit être postérieure ou égale à la date actuelle."
            )

        return value

    def validate_salaire_min(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Le salaire minimum ne peut pas être négatif."
            )

        return value

    def validate_salaire_max(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Le salaire maximum ne peut pas être négatif."
            )

        return value

    def validate_diplome_requis(self, value):
        """
        Une fois qu'un diplôme requis existe, il ne peut pas être
        supprimé lors d'une modification.
        """

        instance = self.instance

        if instance:
            ancien_diplome = (instance.diplome_requis or "").strip()
            nouveau_diplome = (value or "").strip()

            if ancien_diplome and not nouveau_diplome:
                raise serializers.ValidationError(
                    "Le diplôme requis déjà défini ne peut pas être supprimé."
                )

        return value

    def validate_competences(self, value):
        """
        Les compétences validées précédemment doivent rester présentes.
        De nouvelles compétences peuvent être ajoutées.
        """
        if isinstance(value, str):
            try:
                import json
                value = json.loads(value)
            except Exception:
                pass

        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Les compétences doivent être fournies sous forme de liste."
            )

        instance = self.instance

        if instance:
            competences_validees = instance.competences_validees or []

            anciennes = {
                str(competence).strip().lower()
                for competence in competences_validees
            }

            nouvelles = {
                str(competence).strip().lower()
                for competence in value
            }

            competences_supprimees = anciennes - nouvelles

            if competences_supprimees:
                raise serializers.ValidationError(
                    "Certaines compétences déjà validées ne peuvent pas "
                    "être supprimées."
                )

        return value

    def validate(self, attrs):
        salaire_min = attrs.get(
            "salaire_min",
            self.instance.salaire_min if self.instance else None
        )

        salaire_max = attrs.get(
            "salaire_max",
            self.instance.salaire_max if self.instance else None
        )

        if (
            salaire_min is not None
            and salaire_max is not None
            and salaire_min > salaire_max
        ):
            raise serializers.ValidationError({
                "salaire_max": (
                    "Le salaire maximum doit être supérieur "
                    "ou égal au salaire minimum."
                )
            })

        return attrs


class OffreCreateDraftSerializer(OffreCreateSerializer):
    """
    Création d'une offre sous forme de brouillon.
    """

    pass


class OffreModerationSerializer(serializers.ModelSerializer):
    """
    Serializer utilisé par l'administrateur pour modérer une offre.
    """

    class Meta:
        model = Offre

        fields = [
            "statut",
            "moderation_status",
            "motif_rejet",
            "motif_suspension",
        ]

    def validate(self, attrs):
        statut = attrs.get(
            "statut",
            self.instance.statut if self.instance else None
        )

        moderation_status = attrs.get(
            "moderation_status",
            self.instance.moderation_status
            if self.instance
            else None
        )

        motif_rejet = attrs.get(
            "motif_rejet",
            self.instance.motif_rejet
            if self.instance
            else ""
        )

        if (
            statut == Offre.Status.REJETEE
            or moderation_status == Offre.ModerationStatus.REJETEE
        ):
            if not motif_rejet.strip():
                raise serializers.ValidationError({
                    "motif_rejet": (
                        "Un motif est obligatoire pour rejeter une offre."
                    )
                })

        return attrs


class OffreStatusSerializer(serializers.Serializer):
    """
    Serializer utilisé pour les actions de changement de statut.
    """

    action = serializers.ChoiceField(
        choices=[
            "soumettre",
            "publier",
            "rejeter",
            "suspendre",
            "archiver",
            "reactiver",
        ]
    )

    motif = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000
    )

    def validate(self, attrs):
        action = attrs["action"]
        motif = attrs.get("motif", "").strip()

        if action in ["rejeter", "suspendre"] and not motif:
            raise serializers.ValidationError({
                "motif": (
                    "Un motif est obligatoire pour cette action."
                )
            })

        return attrs


class OffreAdminSerializer(serializers.ModelSerializer):
    """
    Serializer complet réservé à l'administration.
    """

    entreprise_nom = serializers.CharField(
        source="entreprise.nom",
        read_only=True
    )

    recruteur_nom = serializers.SerializerMethodField()

    recruteur_email = serializers.EmailField(
        source="recruteur.email",
        read_only=True
    )

    entreprise_verifiee = serializers.BooleanField(
        read_only=True
    )

    class Meta:
        model = Offre

        fields = [
            "id",
            "reference",
            "titre",
            "slug",

            "entreprise",
            "entreprise_nom",
            "entreprise_verifiee",

            "recruteur",
            "recruteur_nom",
            "recruteur_email",

            "description",
            "missions",
            "profil_recherche",

            "type_contrat",
            "niveau_experience",
            "experience_requise",
            "niveau_etudes",
            "diplome_requis",

            "competences",
            "competences_validees",

            "localisation",
            "mode_travail",

            "salaire_min",
            "salaire_max",
            "devise",
            "salaire_confidentiel",

            "avantages",
            "flyer",

            "date_publication",
            "date_limite",
            "date_expiration",
            "date_archivage",

            "statut",
            "moderation_status",

            "motif_rejet",
            "motif_suspension",

            "nombre_vues",
            "nombre_candidatures",

            "created_at",
            "updated_at",
        ]

    def get_recruteur_nom(self, obj):
        if not obj.recruteur:
            return None

        nom = obj.recruteur.get_full_name()

        if nom:
            return nom

        return obj.recruteur.email


class OffreSearchSerializer(serializers.Serializer):
    """
    Paramètres de recherche d'offres.
    """

    search = serializers.CharField(
        required=False,
        allow_blank=True
    )

    type_contrat = serializers.ChoiceField(
        choices=Offre.ContractType.choices,
        required=False
    )

    localisation = serializers.CharField(
        required=False,
        allow_blank=True
    )

    mode_travail = serializers.ChoiceField(
        choices=Offre.WorkMode.choices,
        required=False
    )

    niveau_experience = serializers.ChoiceField(
        choices=Offre.ExperienceLevel.choices,
        required=False
    )

    niveau_etudes = serializers.ChoiceField(
        choices=Offre.EducationLevel.choices,
        required=False
    )