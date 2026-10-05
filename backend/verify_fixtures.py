import os,json,uuid
os.environ.setdefault("DJANGO_SETTINGS_MODULE","config.settings")
import django
django.setup()
from django.db import transaction
from django.test import override_settings
from unittest.mock import patch
from pathlib import Path
from plateforme.tests import PlatformTests
from users.models import User
from plateforme.models import Entretien
from django.utils import timezone
from datetime import timedelta
manager=User.objects
original=manager.create_user
prefix="validation_"+uuid.uuid4().hex[:8]+"_"
def create(**kwargs):
    kwargs["username"]=prefix+kwargs["username"]
    kwargs["email"]=prefix+kwargs["email"]
    return original(**kwargs)
with override_settings(ALLOWED_HOSTS=["testserver"],PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"]), transaction.atomic(), patch.object(manager,"create_user",side_effect=create):
    from rest_framework.test import APIClient
    case=PlatformTests();case.client=APIClient();case.setUp()
    app=case.submit()
    Entretien.objects.create(candidature=app,date=timezone.now()+timedelta(days=3))
    paths=["/users/me/","/users/cvs/","/users/candidate/profile/","/users/recruiter/company/","/users/recruiter/profile/","/offres/","/offres/recruteur/mes-offres/","/offres/admin/all/","/candidatures/","/candidats/","/entretiens/","/notifications/","/preferences/","/alertes/","/favoris/","/generations/","/dashboard/","/administration/users/","/administration/entreprises/","/administration/statistics/","/administration/settings/"]
    fixtures={}
    for role,user in [("candidat",case.candidate),("recruteur",case.recruiter),("admin",case.admin)]:
        case.auth(user);data={}
        for path in paths:
            response=case.client.get("/api"+path)
            if response.status_code==200:data[path]=response.data
        for path,pk in [("/offres/",case.offer.pk),("/candidats/",case.candidate.pk),("/administration/users/",case.candidate.pk),("/administration/entreprises/",case.company.pk)]:
            response=case.client.get("/api"+path+str(pk)+"/")
            if response.status_code==200:data[path+"1/"]=response.data
        fixtures[role]=data
    Path(".local/render-fixtures.json").write_text(json.dumps(fixtures,default=str),encoding="utf8")
    transaction.set_rollback(True)
print("Fixtures de validation créées sans conserver les comptes ni les candidatures.")
