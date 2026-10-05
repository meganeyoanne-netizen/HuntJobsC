from django.core import mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.cache import cache
from .models import GenerationIA
import json
import tempfile
from io import BytesIO
from zipfile import ZipFile
from datetime import timedelta
from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User, ProfilCandidat, ProfilRecruteur, Entreprise, CV
from offres.models import Offre
from candidatures.models import Candidature
from candidatures.services import score_candidate_offer
from .models import Entretien, Notification

@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"], MEDIA_ROOT=tempfile.mkdtemp(), REST_FRAMEWORK={"DEFAULT_AUTHENTICATION_CLASSES":["plateforme.authentication.ActiveJWTAuthentication"],"DEFAULT_PERMISSION_CLASSES":["rest_framework.permissions.IsAuthenticated"]})
class PlatformTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.candidate = User.objects.create_user(username="candidate", email="candidate@test.fr", password="HuntjobsTest42!", role="CANDIDAT")
        self.profile = ProfilCandidat.objects.create(user=self.candidate, competences=["React","Django"], annees_experience=3)
        self.cv = CV.objects.create(candidat=self.profile, contenu_en_ligne={"competences":["React","Django"]})
        self.recruiter = User.objects.create_user(username="recruiter", email="recruiter@test.fr", password="HuntjobsTest42!", role="RECRUTEUR")
        self.company = Entreprise.objects.create(profil_recruteur=ProfilRecruteur.objects.create(user=self.recruiter), nom="Entreprise réelle")
        self.other = User.objects.create_user(username="other", email="other@test.fr", password="HuntjobsTest42!", role="RECRUTEUR")
        Entreprise.objects.create(profil_recruteur=ProfilRecruteur.objects.create(user=self.other), nom="Autre")
        self.admin = User.objects.create_user(username="admin", email="admin@test.fr", password="HuntjobsTest42!", role="ADMIN")
        self.offer = Offre.objects.create(titre="Développeur", entreprise=self.company, recruteur=self.recruiter, description="React Django", localisation="Douala", type_contrat="CDI", date_limite=timezone.localdate()+timedelta(days=30), competences=["React","Django"], experience_requise=2, statut="PUBLIEE")
    def auth(self, user):
        self.client.force_authenticate(user=user)
    def submit(self):
        self.auth(self.candidate)
        response = self.client.post("/api/candidatures/", {"offre":self.offer.pk,"cv":self.cv.pk}, format="json")
        self.assertEqual(response.status_code,201,response.data)
        return Candidature.objects.get(pk=response.data["id"])
    def test_public_offers_and_health(self):
        self.assertEqual(self.client.get("/api/health/").status_code,200)
        response=self.client.get("/api/offres/")
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.data),1)
    @patch("ia.views.complete", return_value="Analyse personnalisée")
    def test_favorite_offer_can_start_analysis_and_interview(self, complete):
        self.auth(self.candidate)
        self.assertEqual(self.client.get("/api/favoris/?details=1").data, [])
        self.client.post("/api/favoris/", {"offre": self.offer.pk}, format="json")
        favorites = self.client.get("/api/favoris/?details=1")
        self.assertEqual(favorites.status_code, 200)
        self.assertEqual([(item["id"], item["titre"]) for item in favorites.data], [(self.offer.pk, self.offer.titre)])
        self.assertEqual(favorites.data[0]["localisation"], "Douala")
        self.assertEqual(favorites.data[0]["type_contrat_label"], "CDI")
        for tool in ("analyse-offre", "simulation-entretien"):
            response = self.client.post(f"/api/ia/{tool}/", {"offre": self.offer.pk}, format="json")
            self.assertEqual(response.status_code, 200, response.data)
            self.assertEqual(complete.call_args.args[1]["offre"]["id"], self.offer.pk)
    def test_register_profiles_and_company(self):
        for role in ["CANDIDAT","RECRUTEUR"]:
            response=self.client.post("/api/users/register/",{"username":role,"email":role+"@test.fr","password":"SolidPass934!","password_confirm":"SolidPass934!","role":role,"company":{"nom":"Mon entreprise"}},format="json")
            self.assertEqual(response.status_code,201,response.data)
            user=User.objects.get(email=role+"@test.fr")
            self.assertTrue(hasattr(user,"profil_candidat" if role=="CANDIDAT" else "profil_recruteur"))
            if role=="RECRUTEUR":self.assertEqual(user.profil_recruteur.entreprise.nom,"Mon entreprise")
    def test_public_admin_registration_forbidden(self):
        response=self.client.post("/api/users/register/",{"username":"evil","email":"evil@test.fr","password":"SolidPass934!","password_confirm":"SolidPass934!","role":"ADMIN"},format="json")
        self.assertEqual(response.status_code,400)
    def test_jwt_login_refresh_logout(self):
        login=self.client.post("/api/users/login/",{"email":self.candidate.email,"password":"HuntjobsTest42!"},format="json")
        self.assertEqual(login.status_code,200,login.data)
        refresh=login.data["tokens"]["refresh"]
        result=self.client.post("/api/users/token/refresh/",{"refresh":refresh},format="json")
        self.assertEqual(result.status_code,200,result.data)
        self.assertEqual(self.client.post("/api/users/token/refresh/",{"refresh":refresh},format="json").status_code,401)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer "+result.data["access"])
        self.assertEqual(self.client.get("/api/users/me/").status_code,200)
        self.assertEqual(self.client.post("/api/users/logout/",{"refresh":result.data["refresh"]},format="json").status_code,200)
        self.assertEqual(self.client.post("/api/users/token/refresh/",{"refresh":result.data["refresh"]},format="json").status_code,401)
    def test_suspended_existing_token_and_refresh_denied(self):
        token=RefreshToken.for_user(self.candidate)
        self.candidate.is_suspended=True;self.candidate.save()
        self.client.credentials(HTTP_AUTHORIZATION="Bearer "+str(token.access_token))
        self.assertEqual(self.client.get("/api/users/me/").status_code,401)
        self.client.credentials()
        self.assertEqual(self.client.post("/api/users/token/refresh/",{"refresh":str(token)},format="json").status_code,401)
    def test_application_no_ats_for_candidate_and_duplicate(self):
        app=self.submit()
        self.auth(self.candidate)
        data=self.client.get(f"/api/candidatures/{app.pk}/").data
        self.assertNotIn("score_compatibilite",data);self.assertNotIn("note_interne",data);self.assertNotIn("analyse_ats",data)
        self.assertEqual(data["compatibilite_label"], "Très bonne compatibilité")
        self.assertEqual(self.client.post("/api/candidatures/",{"offre":self.offer.pk,"cv":self.cv.pk},format="json").status_code,400)
        self.offer.refresh_from_db();self.assertEqual(self.offer.nombre_candidatures,1)
        self.auth(self.recruiter)
        data=self.client.get(f"/api/candidatures/{app.pk}/").data
        self.assertGreaterEqual(float(data["score_compatibilite"]),0);self.assertLessEqual(float(data["score_compatibilite"]),100)
        self.assertEqual(data["analyse_ats"]["method"], "rules-v2")
        self.assertTrue(data["cv_nom_fichier"].endswith(".txt"))

    def test_ats_uses_offer_profile_cv_and_normalised_skills(self):
        self.profile.titre_professionnel = "Développeuse React"
        self.profile.competences = ["ReactJS", "Django"]
        self.profile.formations = [{"diplome": "Licence informatique"}]
        self.profile.save()
        self.offer.titre = "Développeur React"
        self.offer.niveau_etudes = "BAC+3"
        self.offer.diplome_requis = "Licence informatique"
        self.offer.save()
        good_score, analysis = score_candidate_offer(self.profile, self.offer, self.cv)
        other_offer = Offre.objects.create(
            titre="Directeur financier", entreprise=self.company, recruteur=self.recruiter,
            description="Pilotage financier", localisation="Douala", type_contrat="CDI",
            date_limite=timezone.localdate()+timedelta(days=30), competences=["SAP", "COBOL"],
            experience_requise=10, niveau_etudes="DOCTORAT", diplome_requis="Doctorat finance",
            statut="PUBLIEE",
        )
        bad_score, _ = score_candidate_offer(self.profile, other_offer, self.cv)
        self.assertGreaterEqual(good_score, 95)
        self.assertLess(bad_score, 25)
        self.assertEqual(analysis["competences_reconnues"], ["React", "Django"])
    def test_foreign_cv_denied(self):
        other_profile=ProfilCandidat.objects.create(user=User.objects.create_user(username="c2",email="c2@test.fr",role="CANDIDAT"))
        foreign_cv=CV.objects.create(candidat=other_profile,contenu_en_ligne={"texte":"CV"})
        self.auth(self.candidate)
        response=self.client.post("/api/candidatures/",{"offre":self.offer.pk,"cv":foreign_cv.pk},format="json")
        self.assertEqual(response.status_code,400)
    def test_unpublished_and_expired_application_denied(self):
        for status in ["BROUILLON","EXPIREE","ARCHIVEE"]:
            self.offer.statut=status;self.offer.save()
            self.auth(self.candidate)
            self.assertEqual(self.client.post("/api/candidatures/",{"offre":self.offer.pk,"cv":self.cv.pk},format="json").status_code,400)
    def test_ownership_and_manual_ats_denied(self):
        app=self.submit()
        self.auth(self.other)
        self.assertEqual(self.client.get(f"/api/candidatures/{app.pk}/").status_code,404)
        self.assertEqual(self.client.get("/api/candidatures/").data,[])
        self.auth(self.recruiter)
        self.assertEqual(self.client.patch(f"/api/candidatures/{app.pk}/",{"score_compatibilite":99},format="json").status_code,400)
        self.auth(self.candidate)
        self.assertEqual(self.client.patch(f"/api/candidatures/{app.pk}/",{"statut":"RETENU"},format="json").status_code,400)

    def test_recruitment_only_advances_one_step_but_can_reject(self):
        app=self.submit()
        self.auth(self.recruiter)
        for forbidden in ["ENTRETIEN", "EVALUATION", "RETENU"]:
            response = self.client.patch(f"/api/candidatures/{app.pk}/", {"statut": forbidden}, format="json")
            self.assertEqual(response.status_code, 400, response.data)
        interview = self.client.post(
            "/api/entretiens/",
            {"candidature": app.pk, "date": (timezone.now()+timedelta(days=2)).isoformat()},
            format="json",
        )
        self.assertEqual(interview.status_code, 400, interview.data)
        self.assertEqual(self.client.patch(f"/api/candidatures/{app.pk}/", {"statut": "PRESELECTION"}, format="json").status_code, 200)
        self.assertEqual(self.client.patch(f"/api/candidatures/{app.pk}/", {"statut": "EVALUATION"}, format="json").status_code, 400)
        self.assertEqual(self.client.patch(f"/api/candidatures/{app.pk}/", {"statut": "REFUSE"}, format="json").status_code, 200)
    def test_full_recruitment_workflow(self):
        app=self.submit()
        self.auth(self.recruiter)
        self.assertEqual(self.client.patch(f"/api/candidatures/{app.pk}/",{"statut":"PRESELECTION","note_interne":"Bonne expérience"},format="json").status_code,200)
        interview=self.client.post("/api/entretiens/",{"candidature":app.pk,"date":(timezone.now()+timedelta(days=2)).isoformat(),"type":"TECHNIQUE"},format="json")
        self.assertEqual(interview.status_code,201,interview.data)
        self.assertEqual(self.client.patch(f"/api/entretiens/{interview.data['id']}/",{"message":"Rendez-vous déplacé","date":(timezone.now()+timedelta(days=3)).isoformat()},format="json").status_code,200)
        for status in ["EVALUATION","RETENU"]:
            response=self.client.patch(f"/api/candidatures/{app.pk}/",{"statut":status},format="json")
            self.assertEqual(response.status_code,200,response.data)
        self.auth(self.candidate)
        self.assertEqual(self.client.get(f"/api/candidatures/{app.pk}/").data["progression"],100)
        self.assertEqual(self.client.patch(f"/api/candidatures/{app.pk}/",{"statut":"RETIREE"},format="json").status_code,400)
        self.assertNotIn("questions",self.client.get("/api/entretiens/").data[0])
    def test_withdrawal(self):
        app=self.submit();self.auth(self.candidate)
        self.assertEqual(self.client.patch(f"/api/candidatures/{app.pk}/",{"statut":"RETIREE","motif_retrait":"Autre poste"},format="json").status_code,200)
        self.auth(self.recruiter)
        self.assertEqual(self.client.patch(f"/api/candidatures/{app.pk}/",{"statut":"PRESELECTION"},format="json").status_code,400)
    def test_interview_foreign_application_and_candidate_writes_denied(self):
        app=self.submit()
        body={"candidature":app.pk,"date":(timezone.now()+timedelta(days=2)).isoformat()}
        self.auth(self.other);self.assertEqual(self.client.post("/api/entretiens/",body,format="json").status_code,400)
        self.auth(self.candidate);self.assertEqual(self.client.post("/api/entretiens/",body,format="json").status_code,400)
    def test_private_files_protected_and_cv_in_use_retained(self):
        app=self.submit()
        self.auth(self.other);self.assertEqual(self.client.get(f"/api/fichiers/cv/{self.cv.pk}/").status_code,403)
        self.auth(self.recruiter);self.assertEqual(self.client.get(f"/api/fichiers/cv/{self.cv.pk}/").status_code,200)
        self.auth(self.candidate);self.assertEqual(self.client.delete(f"/api/users/cvs/{self.cv.pk}/").status_code,400)
        self.assertEqual(self.client.get("/media/cvs/secret.pdf").status_code,404)
    def test_cv_upload_validation_and_primary(self):
        self.auth(self.candidate)
        invalid=SimpleUploadedFile("evil.pdf",b"not-a-pdf",content_type="application/pdf")
        self.assertEqual(self.client.post("/api/users/cvs/",{"titre":"Bad","fichier":invalid},format="multipart").status_code,400)
        second=CV.objects.create(candidat=self.profile,contenu_en_ligne={"texte":"CV"})
        for cv in [self.cv,second]:
            self.assertEqual(self.client.post(f"/api/users/cvs/{cv.pk}/primary/",{},format="json").status_code,200)
        self.assertEqual(CV.objects.filter(candidat=self.profile,is_primary=True).count(),1)
    def test_admin_permissions_and_suspend(self):
        self.auth(self.candidate)
        for route in ["/api/administration/users/","/api/administration/entreprises/","/api/administration/statistics/","/api/administration/settings/"]:
            self.assertEqual(self.client.get(route).status_code,403,route)
        self.auth(self.admin)
        self.assertEqual(self.client.patch(f"/api/administration/users/{self.candidate.pk}/",{"is_suspended":True},format="json").status_code,200)
        self.assertEqual(self.client.get("/api/administration/statistics/").data["utilisateurs"],4)
    def test_company_locking(self):
        self.company.email_professionnel="contact@test.fr";self.company.nui="NUI42";self.company.request_verification()
        self.auth(self.recruiter)
        self.assertEqual(self.client.patch("/api/users/recruiter/company/",{"nui":"Other"},format="json").status_code,400)
        self.auth(self.admin)
        self.assertEqual(self.client.post(f"/api/administration/entreprises/{self.company.pk}/",{"action":"unlock-nui"},format="json").status_code,200)
        self.auth(self.recruiter)
        self.assertEqual(self.client.patch("/api/users/recruiter/company/",{"nui":"Other"},format="json").status_code,200)
    @override_settings(GROQ_API_KEY="")
    def test_missing_groq_explicit_error(self):
        self.auth(self.candidate)
        self.assertEqual(self.client.post("/api/ia/conseiller-cv/",{},format="json").status_code,503)
    @patch("ia.views.complete")
    def test_ia_distinct_flows_and_persistence(self, complete):
        complete.return_value="CV réel"
        self.auth(self.candidate)
        result=self.client.post("/api/ia/generer-cv/",{},format="json")
        self.assertEqual(result.status_code,200,result.data)
        self.assertEqual(complete.call_args.args[0],"generer-cv")
        self.assertEqual(len(self.client.get("/api/generations/").data),1)
        generation = GenerationIA.objects.get(pk=result.data["id"])
        self.assertEqual(generation.source_data["profil"]["competences"], ["React", "Django"])
        self.assertNotIn("source_data", result.data["document"])
        app=self.submit()
        interview=Entretien.objects.create(candidature=app,date=timezone.now()+timedelta(days=3))
        complete.return_value=json.dumps({"questions":[{"id":i,"question":"Question réelle","expectedAnswer":"Réponse","keyPoints":["Django"]} for i in range(5)]})
        self.auth(self.recruiter)
        result=self.client.post("/api/ia/questions-entretien/",{"entretien":interview.pk,"nombre":5},format="json")
        self.assertEqual(result.status_code,200,result.data);self.assertEqual(complete.call_args.args[0],"questions-entretien")
        self.auth(self.other);self.assertEqual(self.client.post("/api/ia/questions-entretien/",{"entretien":interview.pk,"nombre":5},format="json").status_code,404)
    def test_notification_ownership_and_preferences(self):
        n=Notification.objects.create(user=self.candidate,titre="Test",message="Test")
        self.auth(self.other);self.assertEqual(self.client.patch(f"/api/notifications/{n.pk}/",{"is_read":True},format="json").status_code,404)
        self.auth(self.candidate);self.assertEqual(self.client.post("/api/notifications/read_all/",{},format="json").status_code,200)
        self.assertEqual(self.client.patch("/api/preferences/",{"notifications":True},format="json").status_code,200)
        self.assertTrue(self.client.get("/api/preferences/").data["notifications"])
    def test_messages_real_application_required(self):
        app=self.submit();self.auth(self.other)
        self.assertEqual(self.client.post("/api/messages/",{"candidature":app.pk,"contenu":"Bonjour"},format="json").status_code,403)
        self.auth(self.recruiter);self.assertEqual(self.client.post("/api/messages/",{"candidature":app.pk,"contenu":"Bonjour"},format="json").status_code,201)
        self.auth(self.candidate);self.assertEqual(len(self.client.get("/api/messages/").data),1)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_password_reset_real_email_and_single_use(self):
        result=self.client.post("/api/users/password-reset/",{"email":self.candidate.email},format="json")
        self.assertEqual(result.status_code,200,result.data)
        self.assertEqual(len(mail.outbox),1)
        token=default_token_generator.make_token(self.candidate)
        data={"uid":urlsafe_base64_encode(force_bytes(self.candidate.pk)),"token":token,"password":"NewSafePassword827!"}
        response=self.client.post("/api/users/password-reset-confirm/",data,format="json")
        self.assertEqual(response.status_code,200,response.data)
        self.assertEqual(self.client.post("/api/users/password-reset-confirm/",data,format="json").status_code,400)
        self.candidate.refresh_from_db();self.assertTrue(self.candidate.check_password(data["password"]))
    def test_committed_submission_notifications(self):
        with self.captureOnCommitCallbacks(execute=True):
            self.submit()
        self.assertTrue(Notification.objects.filter(user=self.candidate,titre="Candidature reçue").exists())
        self.assertTrue(Notification.objects.filter(user=self.recruiter,titre="Nouvelle candidature").exists())
    @patch("ia.views.complete",return_value="Analyse du document réel")
    def test_imported_text_reaches_ia(self,complete):
        self.auth(self.candidate)
        document=SimpleUploadedFile("offre.txt","Mission : développer des API Django.".encode())
        response=self.client.post("/api/ia/analyse-offre/",{"fichier":document},format="multipart")
        self.assertEqual(response.status_code,200,response.data)
        self.assertIn("API Django",complete.call_args.args[1]["document_importe"])

    @patch("ia.views.complete",return_value="Conseils personnalisés")
    def test_cv_advisor_accepts_selected_cv(self,complete):
        self.auth(self.candidate)
        response=self.client.post("/api/ia/conseiller-cv/",{"cv":self.cv.pk},format="json")
        self.assertEqual(response.status_code,200,response.data)
        self.assertEqual(complete.call_args.args[0],"conseiller-cv")
        self.assertEqual(complete.call_args.args[1]["cv"],self.cv.contenu_en_ligne)
    def test_alert_persistence_and_ownership(self):
        self.auth(self.candidate)
        response=self.client.post("/api/alertes/",{"title":"Mes offres","keyword":"Django, React","contracts":["CDI","CDD"],"domain":"Informatique","email":True},format="json")
        self.assertEqual(response.status_code,201,response.data)
        pk=response.data["id"]
        self.assertEqual(self.client.get("/api/alertes/").data[0]["contracts"],["CDI","CDD"])
        self.auth(self.other);self.assertEqual(self.client.patch(f"/api/alertes/{pk}/",{"active":False},format="json").status_code,404)
    def test_generation_delete_scoped(self):
        item=GenerationIA.objects.create(user=self.candidate,outil="portfolio",titre="Portfolio",contenu="Mon travail")
        self.auth(self.other);self.assertEqual(self.client.delete(f"/api/generations/{item.pk}/").status_code,404)
        self.auth(self.candidate);self.assertEqual(self.client.delete(f"/api/generations/{item.pk}/").status_code,204)

    def test_generated_document_downloads_pdf_and_docx_with_selected_design(self):
        self.candidate.first_name="Camille";self.candidate.last_name="Martin";self.candidate.telephone="+237 600 000 000";self.candidate.save()
        self.profile.titre_professionnel="Cheffe de projet"
        self.profile.bio="Je coordonne des projets numériques utiles, de la définition du besoin jusqu'à la livraison."
        self.profile.localisation="Douala"
        self.profile.experiences=[{"position":"Cheffe de projet","company":"HuntJobs","startDate":"2022","endDate":"2026","description":"Pilotage des équipes et livraison de produits numériques."}]
        self.profile.formations=[{"degree":"Master informatique","school":"Université de Douala","startDate":"2017","endDate":"2019"}]
        self.profile.langues=["Français", "Anglais"]
        self.profile.save()
        self.auth(self.candidate)
        expected_colors={"cv-classique":"1E3A8A","cv-moderne":"123C57","cv-creatif":"312E81","libre":"DBEAFE"}
        pdf_results=[];docx_results=[];last_item=None
        for design,color in expected_colors.items():
            last_item=GenerationIA.objects.create(user=self.candidate,outil="generer-cv",titre="CV généré",contenu="## Profil\nCheffe de projet numérique.\n\n## Expérience\n- API Django\n- Interfaces React",design=design)
            pdf=self.client.get(f"/api/generations/{last_item.pk}/download/?type=pdf")
            self.assertEqual(pdf.status_code,200,getattr(pdf,"data",None));pdf_bytes=b"".join(pdf.streaming_content)
            self.assertEqual(pdf["Content-Type"],"application/pdf");self.assertTrue(pdf_bytes.startswith(b"%PDF"));pdf_results.append(pdf_bytes)
            docx=self.client.get(f"/api/generations/{last_item.pk}/download/?type=docx")
            self.assertEqual(docx.status_code,200);docx_bytes=b"".join(docx.streaming_content)
            self.assertEqual(docx["Content-Type"],"application/vnd.openxmlformats-officedocument.wordprocessingml.document");self.assertTrue(docx_bytes.startswith(b"PK"));docx_results.append(docx_bytes)
            with ZipFile(BytesIO(docx_bytes)) as archive:
                xml=archive.read("word/document.xml").decode("utf-8")
            self.assertIn(color,xml);self.assertIn("Camille Martin",xml)
        self.assertEqual(len({len(value) for value in pdf_results}),4)
        self.assertEqual(len({len(value) for value in docx_results}),4)
        self.auth(self.other)
        self.assertEqual(self.client.get(f"/api/generations/{last_item.pk}/download/?type=pdf").status_code,404)

    @patch("ia.views.complete",return_value="# Objet\n\nMadame, Monsieur,\n\nMa candidature.")
    def test_cover_letter_keeps_selected_design(self, complete):
        self.auth(self.candidate)
        response=self.client.post("/api/ia/lettre-motivation/",{"design":"lettre-elegante","texte":"Poste visé"},format="json")
        self.assertEqual(response.status_code,200,response.data)
        generation=GenerationIA.objects.get(pk=response.data["id"])
        self.assertEqual(generation.design,"lettre-elegante")
        self.assertEqual(response.data["document"]["design"],"lettre-elegante")
        self.assertIn("Lettre élégante",complete.call_args.args[1]["design"])
    def test_verification_documents_required(self):
        self.auth(self.recruiter)
        response=self.client.post("/api/users/recruiter/company/request-verification/",{"email_professionnel":"contact@test.fr","nui":"NUI42"},format="json")
        self.assertEqual(response.status_code,400,response.data)
        self.company.refresh_from_db();self.assertEqual(self.company.verification_status,"NOT_STARTED")

    @patch("ia.views.complete")
    def test_image_import_uses_vision_then_selected_tool(self, complete):
        from io import BytesIO
        from PIL import Image
        stream=BytesIO()
        Image.new("RGB",(2,2),color="white").save(stream,format="PNG")
        complete.side_effect=["Mission Django réelle","Analyse réelle"]
        self.auth(self.candidate)
        response=self.client.post("/api/ia/analyse-offre/",{"image":SimpleUploadedFile("offre.png",stream.getvalue(),content_type="image/png")},format="multipart")
        self.assertEqual(response.status_code,200,response.data)
        self.assertEqual([call.args[0] for call in complete.call_args_list],["lire-image","analyse-offre"])
        self.assertTrue(complete.call_args_list[0].kwargs["image"].startswith("data:image/png;base64,"))
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_alert_worker_delivers_real_email_and_no_duplicate(self):
        from django.core.management import call_command
        from .models import Alerte
        alert=Alerte.objects.create(user=self.candidate,title="Django",keyword="Django,React",contracts=["CDI"],email=True,frequency="Instantanée")
        self.offer.date_publication=timezone.now();self.offer.save()
        call_command("send_alerts")
        self.assertEqual(len(mail.outbox),1)
        self.assertIn(self.offer.titre,mail.outbox[0].body)
        call_command("send_alerts");self.assertEqual(len(mail.outbox),1)
        alert.refresh_from_db();self.assertIsNotNone(alert.last_sent_at)
    def test_profile_completion_and_json_validation(self):
        self.auth(self.candidate)
        response=self.client.patch("/api/users/candidate/profile/",{"bio":"Mon parcours réel","localisation":"Douala","experiences":[{"company":"Entreprise","position":"Développeur"}]},format="json")
        self.assertEqual(response.status_code,200,response.data)
        self.assertGreater(response.data["profile"]["profile_completion"],0)
        self.assertEqual(self.client.patch("/api/users/candidate/profile/",{"competences":{"invalid":"object"}},format="json").status_code,400)
    def test_superuser_me_preserves_admin_access(self):
        self.admin.is_superuser=True;self.admin.role="CANDIDAT";self.admin.save()
        self.auth(self.admin)
        self.assertTrue(self.client.get("/api/users/me/").data["is_admin_role"])
        self.assertEqual(self.client.get("/api/administration/users/").status_code,200)

    def test_offer_create_submit_approve_publishes_for_candidate(self):
        self.auth(self.recruiter)
        payload={"titre":"Développeur React","description":"Créer des applications React pour notre entreprise.","localisation":"Douala","type_contrat":"CDI","date_limite":str(timezone.localdate()+timedelta(days=30)),"diplome_requis":"Licence informatique","competences":["React"],"niveau_experience":"DEBUTANT"}
        response=self.client.post("/api/offres/recruteur/create/",payload,format="json")
        self.assertEqual(response.status_code,201,response.data)
        pk=response.data["id"]
        response=self.client.post(f"/api/offres/recruteur/{pk}/submit/",{},format="json")
        self.assertEqual(response.status_code,200,response.data)
        self.auth(self.admin)
        response=self.client.post(f"/api/offres/admin/{pk}/approve/",{},format="json")
        self.assertEqual(response.status_code,200,response.data)
        self.assertEqual(response.data["offre"]["statut"],"PUBLIEE")
        self.auth(self.candidate)
        self.assertEqual(self.client.get(f"/api/offres/{pk}/").status_code,200)
