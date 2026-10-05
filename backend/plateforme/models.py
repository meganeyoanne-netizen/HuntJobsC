from django.conf import settings
from django.db import models

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    titre = models.CharField(max_length=255)
    message = models.TextField()
    destination = models.CharField(max_length=100, blank=True)
    resource_id = models.PositiveBigIntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]

class Entretien(models.Model):
    class Type(models.TextChoices):
        TECHNIQUE = "TECHNIQUE", "Technique"
        RH = "RH", "RH"
        COMPORTEMENTAL = "COMPORTEMENTAL", "Comportemental"
        MOTIVATION = "MOTIVATION", "Motivation"
        MIXTE = "MIXTE", "Mixte"
    class Status(models.TextChoices):
        PLANIFIE = "PLANIFIE", "À venir"
        TERMINE = "TERMINE", "Terminé"
        ANNULE = "ANNULE", "Annulé"
    candidature = models.ForeignKey("candidatures.Candidature", on_delete=models.CASCADE, related_name="entretiens")
    date = models.DateTimeField()
    duree = models.PositiveIntegerField(default=60)
    type = models.CharField(max_length=30, choices=Type.choices, default=Type.MIXTE)
    statut = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANIFIE)
    message = models.TextField(blank=True)
    lieu = models.CharField(max_length=255, blank=True)
    lien_visio = models.URLField(blank=True)
    questions = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Alerte(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    keyword = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    contracts = models.JSONField(default=list, blank=True)
    experience = models.CharField(max_length=100, blank=True)
    domain = models.CharField(max_length=100, blank=True)
    salary = models.CharField(max_length=100, blank=True)
    email = models.BooleanField(default=True)
    contract = models.CharField(max_length=30, blank=True)
    last_sent_at = models.DateTimeField(null=True, blank=True)
    frequency = models.CharField(max_length=30, default="daily")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Favori(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    offre = models.ForeignKey("offres.Offre", on_delete=models.CASCADE)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "offre"], name="unique_favori")]

class Preference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    data = models.JSONField(default=dict, blank=True)

class Parametre(models.Model):
    key = models.CharField(max_length=100, unique=True, default="general")
    data = models.JSONField(default=dict, blank=True)

class Message(models.Model):
    candidature = models.ForeignKey("candidatures.Candidature", on_delete=models.CASCADE, related_name="messages")
    expediteur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    contenu = models.TextField()
    lien_visio = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class GenerationIA(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    outil = models.CharField(max_length=80)
    titre = models.CharField(max_length=255)
    contenu = models.TextField()
    design = models.CharField(max_length=50, default="libre")
    source_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]


class JournalAdmin(models.Model):
    acteur = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True)
    cible_type = models.CharField(max_length=40)
    cible_id = models.PositiveBigIntegerField()
    action = models.CharField(max_length=100)
    motif = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]
