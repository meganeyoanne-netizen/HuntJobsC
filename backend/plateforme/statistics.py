from datetime import timedelta
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncMonth
from users.models import User
from offres.models import Offre
from candidatures.models import Candidature
from .models import Entretien, Notification

def statistics(user):
    today = timezone.localdate()
    months = {}
    for model, date_field, key in [(User,"created_at","users"), (Offre,"created_at","offers"), (Candidature,"date_candidature","applications")]:
        rows = model.objects.annotate(month=TruncMonth(date_field)).values("month").annotate(count=Count("pk")).order_by("month")
        for row in rows:
            label = row["month"].strftime("%Y-%m")
            months.setdefault(label, {"month": label, "users": 0, "offers": 0, "applications": 0})[key] = row["count"]
    user_count=User.objects.count()
    app_count=Candidature.objects.count()
    interview_count=Entretien.objects.filter(statut="PLANIFIE").count()
    complete_count=User.objects.filter(profil_candidat__profile_completion__gte=80).count()
    closed_count=Offre.objects.filter(statut__in=["EXPIREE","ARCHIVEE"]).count()
    job_count=Offre.objects.count()
    weekly = []
    for offset in range(6,-1,-1):
        day = today - timedelta(days=offset)
        weekly.append({"day":day.strftime("%d/%m"), "value":Candidature.objects.filter(date_candidature__date=day).count()})
    return {"monthly": list(months.values())[-12:], "weekly_activity": weekly,
        "activity": [{"label":"Candidatures envoyées","value":Candidature.objects.count(),"percentage":100,"color":"blue"},
                     {"label":"Profils complétés","value":User.objects.filter(profil_candidat__profile_completion__gte=80).count(),"percentage":round(complete_count*100/max(1,user_count)),"color":"violet"},
                     {"label":"Entretiens planifiés","value":Entretien.objects.filter(statut="PLANIFIE").count(),"percentage":round(interview_count*100/max(1,app_count)),"color":"cyan"},
                     {"label":"Offres clôturées","value":Offre.objects.filter(statut__in=["EXPIREE","ARCHIVEE"]).count(),"percentage":round(closed_count*100/max(1,job_count)),"color":"emerald"}],
        "top_jobs":[{"title":o.titre,"applications":o.nombre_candidatures,"offers":1,"color":"blue"} for o in Offre.objects.order_by("-nombre_candidatures")[:5]],
        "recent":[{"id":n.pk,"title":n.titre,"description":n.message,"time":n.created_at.isoformat(),"type":"offer"} for n in Notification.objects.filter(user=user)[:10]]}
