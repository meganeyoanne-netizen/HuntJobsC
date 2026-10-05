from django.db import transaction
from django.db.models.deletion import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import CV, ProfilCandidat
from .permissions import IsCandidate
from .serializers import CVSerializer

def validate_file(file, pdf_only=False):
    if not file:
        return file
    if file.size > 10 * 1024 * 1024:
        raise ValidationError("Le fichier ne doit pas dépasser 10 Mo.")
    ext = file.name.rsplit(".", 1)[-1].lower()
    if ext not in (["pdf"] if pdf_only else ["pdf", "png", "jpg", "jpeg", "docx", "txt"]):
        raise ValidationError("Format de fichier non autorisé.")
    if ext == "pdf":
        header = file.read(5)
        file.seek(0)
        if header != b"%PDF-":
            raise ValidationError("Le contenu du fichier n'est pas un PDF.")
    return file

class CVPrimaryView(APIView):
    permission_classes = [IsCandidate]
    @transaction.atomic
    def post(self, request, pk):
        profile = ProfilCandidat.objects.select_for_update().get(user=request.user)
        cv = get_object_or_404(CV, pk=pk, candidat=profile)
        CV.objects.filter(candidat=profile).update(is_primary=False)
        cv.is_primary = True
        cv.save(update_fields=["is_primary"])
        return Response(CVSerializer(cv).data)

def delete_cv(instance):
    try:
        instance.delete()
    except ProtectedError:
        raise ValidationError("Ce CV est utilisé dans une candidature et doit être conservé.")
