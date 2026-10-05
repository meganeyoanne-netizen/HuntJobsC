from django.contrib import admin
from .models import Candidature
@admin.register(Candidature)
class CandidatureAdmin(admin.ModelAdmin):
    list_display = ["id", "candidat", "offre", "statut", "date_candidature"]
    list_filter = ["statut"]
    readonly_fields = ["score_compatibilite", "analyse_ats"]
