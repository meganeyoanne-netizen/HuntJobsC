from django.db import transaction
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Candidature
from .serializers import CandidatureSerializer
from .services import submit_application, update_application

def scoped_applications(user):
    qs = Candidature.objects.select_related("candidat__profil_candidat", "offre__entreprise", "cv")
    if user.is_admin_role or user.is_superuser:
        return qs
    if user.is_candidate:
        return qs.filter(candidat=user)
    return qs.filter(offre__recruteur=user)

class CandidatureList(generics.ListCreateAPIView):
    serializer_class = CandidatureSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        qs = scoped_applications(self.request.user)
        for field in ["offre", "statut"]:
            value = self.request.query_params.get(field)
            if value:
                qs = qs.filter(**{field: value})
        return qs
    def perform_create(self, serializer):
        if not self.request.user.is_candidate:
            raise PermissionDenied("Seuls les candidats peuvent candidater.")
        serializer.instance = submit_application(self.request.user, serializer.validated_data)

class CandidatureDetail(generics.RetrieveUpdateAPIView):
    serializer_class = CandidatureSerializer
    http_method_names = ["get", "patch", "head", "options"]
    def get_queryset(self):
        return scoped_applications(self.request.user)
    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        application = self.get_queryset().select_for_update(of=("self",)).get(pk=self.get_object().pk)
        update_application(application, request.data, request.user.is_candidate)
        return Response(self.get_serializer(application).data)
