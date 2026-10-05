import re
from decimal import Decimal, InvalidOperation
from django.db.models import Q
from django.utils import timezone
from offres.models import Offre

def matching_offers(alert):
    qs=Offre.objects.filter(statut="PUBLIEE",date_limite__gte=timezone.localdate(),entreprise__is_active=True,entreprise__is_suspended=False)
    terms=[term.strip() for term in alert.keyword.split(",") if term.strip()]
    if terms:
        condition=Q()
        for term in terms:
            condition |= Q(titre__icontains=term)|Q(description__icontains=term)
        qs=qs.filter(condition)
    if alert.location:
        qs=qs.filter(localisation__icontains=alert.location)
    contracts=alert.contracts or ([alert.contract] if alert.contract else [])
    if contracts:
        qs=qs.filter(type_contrat__in=[contract.upper() for contract in contracts])
    if alert.domain:
        qs=qs.filter(entreprise__secteur_activite__icontains=alert.domain)
    if alert.experience:
        numbers=re.findall(r"\d+",alert.experience)
        if numbers: qs=qs.filter(experience_requise__gte=int(numbers[0]))
        if len(numbers)>1: qs=qs.filter(experience_requise__lte=int(numbers[1]))
        if "début" in alert.experience.casefold(): qs=qs.filter(niveau_experience="DEBUTANT")
        if "senior" in alert.experience.casefold(): qs=qs.filter(niveau_experience="SENIOR")
    if alert.salary:
        try: minimum=Decimal(re.sub(r"[^0-9.]", "", alert.salary))
        except InvalidOperation: minimum=None
        if minimum is not None: qs=qs.filter(salaire_max__gte=minimum)
    return qs
