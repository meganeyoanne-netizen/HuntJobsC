import time
from datetime import timedelta
from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.db import transaction, close_old_connections, connection
from django.utils import timezone
from plateforme.models import Alerte
from plateforme.alerts import matching_offers

class Command(BaseCommand):
    help="Envoie les alertes email réelles. --loop 60 maintient un worker local."
    def add_arguments(self,parser):
        parser.add_argument("--loop",type=int,default=0)
    def handle(self,*args,**options):
        while True:
            if not connection.in_atomic_block:
                close_old_connections()
            for pk in Alerte.objects.filter(active=True,email=True,user__is_active=True,user__is_suspended=False).values_list("pk",flat=True):
                try:
                    with transaction.atomic():
                        alert=Alerte.objects.select_for_update().select_related("user").get(pk=pk)
                        frequency=alert.frequency.casefold()
                        delay=timedelta(days=7 if "hebdo" in frequency or "weekly" in frequency else 0 if "instant" in frequency else 1)
                        now=timezone.now()
                        if alert.last_sent_at and now-alert.last_sent_at<delay:
                            continue
                        offers=list(matching_offers(alert).filter(date_publication__gt=alert.last_sent_at or alert.created_at)[:50])
                        if offers:
                            body="\n\n".join(o.titre+" — "+o.localisation+"\n"+settings.FRONTEND_URL+" (offre #"+str(o.pk)+")" for o in offers)
                            send_mail("JobConnect — "+alert.title,body,settings.DEFAULT_FROM_EMAIL,[alert.user.email],fail_silently=False)
                            self.stdout.write(f"Alerte {pk}: {len(offers)} offre(s).")
                        alert.last_sent_at=now
                        alert.save(update_fields=["last_sent_at"])
                except Exception as exc:
                    self.stderr.write(f"Alerte {pk} non envoyée : {type(exc).__name__}.")
            if not options["loop"]:
                break
            time.sleep(max(10,options["loop"]))
