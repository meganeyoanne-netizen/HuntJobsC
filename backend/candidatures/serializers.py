from pathlib import Path

from rest_framework import serializers
from .models import Candidature
from .services import compatibility_label
from users.serializers import UserSerializer, ProfilCandidatSerializer
from offres.serializers import OffreListSerializer

class CandidatureSerializer(serializers.ModelSerializer):
    offre_detail = OffreListSerializer(source="offre", read_only=True)
    candidat_detail = UserSerializer(source="candidat", read_only=True)
    profil = ProfilCandidatSerializer(source="candidat.profil_candidat", read_only=True)
    progression = serializers.IntegerField(read_only=True)
    statut_label = serializers.CharField(read_only=True)
    compatibilite_label = serializers.SerializerMethodField()
    cv_titre = serializers.CharField(source="cv.titre", read_only=True)
    cv_nom_fichier = serializers.SerializerMethodField()
    class Meta:
        model = Candidature
        fields = "__all__"
        read_only_fields = [f.name for f in Candidature._meta.fields if f.name not in ["offre", "cv", "lettre_motivation", "message_candidat", "source"]]
        validators = []
    def get_compatibilite_label(self, instance):
        if instance.score_compatibilite is None:
            return "Analyse en cours"
        return compatibility_label(instance.score_compatibilite)
    def get_cv_nom_fichier(self, instance):
        if instance.cv.fichier:
            return Path(instance.cv.fichier.name).name
        return f"cv-{instance.candidat_id}.txt"
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if self.context["request"].user.is_candidate:
            for key in ["score_compatibilite", "analyse_ats", "score_ats_calcule", "date_analyse_ats", "note_interne", "candidat_detail", "profil"]:
                data.pop(key, None)
        return data
