from rest_framework import serializers
from .models import Parametre

DEFAULTS = {
    "platformName": "JobConnect", "platformEmail": "contact@jobconnect.cm",
    "platformPhone": "", "country": "Cameroun", "language": "Français",
    "homeTitle": "Votre talent mérite la bonne opportunité.",
    "homeDescription": "JobConnect connecte les talents et les entreprises grâce à une plateforme moderne, intelligente et conçue pour simplifier chaque étape du recrutement.",
    "maintenanceMessage": "La plateforme est temporairement en maintenance. Merci de réessayer plus tard.",
    "allowRegistration": True, "maintenanceMode": False, "aiEnabled": True,
    "aiOfferAnalysis": True, "aiInterviewSimulation": True, "aiCVAdvisor": True,
    "aiRecruiterQuestions": True,
}

def get_platform_settings():
    saved = Parametre.objects.filter(key="general").values_list("data", flat=True).first() or {}
    return {**DEFAULTS, **saved}

class PlatformSettingsSerializer(serializers.Serializer):
    platformName = serializers.CharField(max_length=100, required=False)
    platformEmail = serializers.EmailField(required=False)
    platformPhone = serializers.CharField(max_length=60, allow_blank=True, required=False)
    country = serializers.CharField(max_length=100, required=False)
    language = serializers.CharField(max_length=60, required=False)
    homeTitle = serializers.CharField(max_length=180, required=False)
    homeDescription = serializers.CharField(max_length=1000, required=False)
    maintenanceMessage = serializers.CharField(max_length=500, required=False)
    allowRegistration = serializers.BooleanField(required=False)
    maintenanceMode = serializers.BooleanField(required=False)
    aiEnabled = serializers.BooleanField(required=False)
    aiOfferAnalysis = serializers.BooleanField(required=False)
    aiInterviewSimulation = serializers.BooleanField(required=False)
    aiCVAdvisor = serializers.BooleanField(required=False)
    aiRecruiterQuestions = serializers.BooleanField(required=False)
