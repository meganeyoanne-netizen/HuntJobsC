from django.db import migrations

def complete_profiles(apps, schema_editor):
    User=apps.get_model("users","User")
    Candidate=apps.get_model("users","ProfilCandidat")
    Recruiter=apps.get_model("users","ProfilRecruteur")
    Company=apps.get_model("users","Entreprise")
    for user in User.objects.filter(role="CANDIDAT"):
        Candidate.objects.get_or_create(user_id=user.pk)
    for user in User.objects.filter(role="RECRUTEUR"):
        profile,_=Recruiter.objects.get_or_create(user_id=user.pk)
        Company.objects.get_or_create(profil_recruteur_id=profile.pk)

class Migration(migrations.Migration):
    dependencies=[("users","0002_cv_unique_primary_cv")]
    operations=[migrations.RunPython(complete_profiles,migrations.RunPython.noop)]
