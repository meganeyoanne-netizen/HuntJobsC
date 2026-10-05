from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db import transaction
from users.models import User, Entreprise
from offres.models import Offre
from candidatures.models import Candidature
from .models import Notification, Entretien, Alerte

def notify(user_id, title, message, destination="", resource_id=None):
    transaction.on_commit(lambda: Notification.objects.create(user_id=user_id, titre=title, message=message, destination=destination, resource_id=resource_id))

def notify_admins(title, message, destination, resource_id):
    for uid in User.objects.filter(role="ADMIN", is_active=True, is_suspended=False).values_list("pk", flat=True):
        notify(uid, title, message, destination, resource_id)

@receiver(pre_save, sender=Candidature)
@receiver(pre_save, sender=Offre)
@receiver(pre_save, sender=Entreprise)
@receiver(pre_save, sender=Entretien)
def remember_previous(sender, instance, **kwargs):
    if instance.pk:
        instance._previous = sender.objects.filter(pk=instance.pk).values().first() or {}
    else:
        instance._previous = {}

@receiver(post_save, sender=Candidature)
def application_events(sender, instance, created, **kwargs):
    if kwargs.get("raw"):
        return
    previous = getattr(instance, "_previous", {})
    if created:
        notify(instance.candidat_id, "Candidature reçue", instance.offre.titre, "candidate-applications", instance.pk)
        notify(instance.offre.recruteur_id, "Nouvelle candidature", instance.candidat.full_name + " : " + instance.offre.titre, "recruiter-applications", instance.offre_id)
    elif previous.get("statut") != instance.statut:
        notify(instance.candidat_id, "Candidature : " + instance.statut_label, instance.offre.titre, "candidate-applications", instance.pk)

@receiver(post_save, sender=Entretien)
def interview_events(sender, instance, created, **kwargs):
    if kwargs.get("raw"):
        return
    if not created and getattr(instance, "_previous", {}).get("date") == instance.date and getattr(instance, "_previous", {}).get("statut") == instance.statut and getattr(instance, "_previous", {}).get("message") == instance.message:
        return
    notify(instance.candidature.candidat_id, "Entretien planifié" if created else "Entretien modifié", instance.candidature.offre.titre + " : " + str(instance.date), "candidate-applications", instance.candidature_id)

@receiver(post_save, sender=Entreprise)
def company_events(sender, instance, created, **kwargs):
    if kwargs.get("raw"):
        return
    old = getattr(instance, "_previous", {}).get("verification_status")
    if instance.verification_status == old:
        return
    if instance.verification_status == "PENDING":
        notify_admins("Vérification entreprise", instance.nom, "admin-recruiter-detail", instance.pk)
    elif instance.verification_status in ["VERIFIED", "REJECTED"]:
        notify(instance.profil_recruteur.user_id, "Vérification entreprise", instance.get_verification_status_display(), "recruiter-company", instance.pk)

@receiver(post_save, sender=Offre)
def offer_events(sender, instance, created, **kwargs):
    if kwargs.get("raw"):
        return
    old = getattr(instance, "_previous", {}).get("statut")
    if old == instance.statut:
        return
    if instance.statut == "EN_ATTENTE":
        notify_admins("Offre à modérer", instance.titre, "admin-offer-detail", instance.pk)
    elif instance.statut in ["PUBLIEE", "REJETEE"]:
        notify(instance.recruteur_id, "Offre : " + instance.get_statut_display(), instance.titre, "recruiter-jobs", instance.pk)
    if instance.statut == "PUBLIEE":
        from .alerts import matching_offers
        for alert in Alerte.objects.filter(active=True,user__is_active=True,user__is_suspended=False):
            if matching_offers(alert).filter(pk=instance.pk).exists():
                notify(alert.user_id, "Nouvelle offre : " + instance.titre, alert.title, "candidate-job-detail", instance.pk)


def record_admin(user,kind,pk,action,reason=""):
    from .models import JournalAdmin
    JournalAdmin.objects.create(acteur=user,cible_type=kind,cible_id=pk,action=action,motif=str(reason)[:5000])
