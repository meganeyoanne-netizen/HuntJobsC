from django.utils import timezone
from rest_framework import serializers
from .models import Entretien, Notification, Alerte, Message, GenerationIA

class EntretienSerializer(serializers.ModelSerializer):
    candidature_detail = serializers.SerializerMethodField()
    def get_candidature_detail(self, obj):
        from candidatures.serializers import CandidatureSerializer
        return CandidatureSerializer(obj.candidature, context=self.context).data
    candidat = serializers.IntegerField(source="candidature.candidat_id", read_only=True)
    candidat_nom = serializers.CharField(source="candidature.candidat.full_name", read_only=True)
    offre = serializers.IntegerField(source="candidature.offre_id", read_only=True)
    offre_titre = serializers.CharField(source="candidature.offre.titre", read_only=True)
    type_label = serializers.CharField(source="get_type_display", read_only=True)
    statut_label = serializers.CharField(source="get_statut_display", read_only=True)
    class Meta:
        model = Entretien
        fields = "__all__"
        read_only_fields = ["questions", "created_at"]
    def validate(self, attrs):
        user = self.context["request"].user
        candidature = attrs.get("candidature", getattr(self.instance, "candidature", None))
        if not candidature or candidature.offre.recruteur_id != user.pk:
            raise serializers.ValidationError({"candidature": "Cette candidature ne concerne pas vos offres."})
        if self.instance and candidature.pk != self.instance.candidature_id:
            raise serializers.ValidationError({"candidature": "La candidature d'un entretien ne peut pas être remplacée."})
        if not self.instance and candidature.statut != "PRESELECTION":
            raise serializers.ValidationError({
                "candidature": (
                    "La candidature doit d'abord passer à l'étape Présélection "
                    "avant de planifier un entretien."
                )
            })
        if candidature.statut in ["RETENU", "REFUSE", "RETIREE"] and (not self.instance or attrs.get("statut") == "PLANIFIE"):
            raise serializers.ValidationError("Cette candidature est terminée.")
        if "date" in attrs and attrs["date"] <= timezone.now():
            raise serializers.ValidationError({"date": "Choisissez une date future."})
        if not 5 <= attrs.get("duree", 60) <= 480:
            raise serializers.ValidationError({"duree": "Durée entre 5 et 480 minutes."})
        return attrs
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if self.context["request"].user.is_candidate:
            data.pop("questions", None)
        return data

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ["user", "titre", "message", "destination", "resource_id", "created_at"]

class AlerteSerializer(serializers.ModelSerializer):
    matches = serializers.SerializerMethodField()
    def get_matches(self,obj):
        from .alerts import matching_offers
        return matching_offers(obj).count()
    def validate_contracts(self,value):
        if not isinstance(value,list) or any(c.upper() not in ["CDI","CDD","STAGE","FREELANCE","ALTERNANCE"] for c in value if isinstance(c,str)) or any(not isinstance(c,str) for c in value):
            raise serializers.ValidationError("Contrats invalides.")
        return [c.upper() for c in value]
    class Meta:
        model = Alerte
        fields = "__all__"
        read_only_fields = ["user", "created_at", "last_sent_at"]

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ["expediteur", "created_at"]

class GenerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenerationIA
        fields = "__all__"
        read_only_fields = ["user", "created_at"]
        extra_kwargs = {"source_data": {"write_only": True}}
