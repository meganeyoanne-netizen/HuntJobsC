from unittest.mock import patch
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User
from .models import Parametre, Notification

@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class PlatformSettingsTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="settings-admin", email="settings-admin@test.fr", password="SettingsTest42!", role="ADMIN")
        self.candidate = User.objects.create_user(username="settings-candidate", email="settings-candidate@test.fr", password="SettingsTest42!", role="CANDIDAT")

    def config(self, **data):
        Parametre.objects.update_or_create(key="general", defaults={"data": data})

    def authenticate(self, user):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + str(RefreshToken.for_user(user).access_token))

    def test_public_settings_only_expose_approved_fields(self):
        self.config(platformName="Emploi Cameroun", platformEmail="contact@test.fr", privateValue="secret", twoFactorAuth=True)
        response = self.client.get("/api/platform/settings/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["platformName"], "Emploi Cameroun")
        self.assertTrue(response.data["allowRegistration"])
        self.assertNotIn("privateValue", response.data)
        self.assertNotIn("twoFactorAuth", response.data)

    def test_settings_require_admin_and_validate_atomically(self):
        self.authenticate(self.candidate)
        self.assertEqual(self.client.patch("/api/administration/settings/", {"platformName": "Wrong"}, format="json").status_code, 403)
        self.authenticate(self.admin)
        result = self.client.patch("/api/administration/settings/", {"platformName": "New Name", "platformEmail": "not-an-email"}, format="json")
        self.assertEqual(result.status_code, 400)
        self.assertFalse(Parametre.objects.exists())
        result = self.client.patch("/api/administration/settings/", {"platformName": "New Name", "aiRecruiterQuestions": False}, format="json")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(self.client.get("/api/platform/settings/").data["platformName"], "New Name")
        self.assertFalse(result.data["aiRecruiterQuestions"])

    def test_registration_can_be_disabled_and_reenabled(self):
        self.config(allowRegistration=False)
        response = self.client.post("/api/users/register/", {}, format="json")
        self.assertEqual(response.status_code, 403)
        self.config(allowRegistration=True)
        response = self.client.post("/api/users/register/", {}, format="json")
        self.assertEqual(response.status_code, 400)  # Normal validation is reachable again.

    def test_maintenance_blocks_public_and_candidate_but_admin_can_disable(self):
        self.config(maintenanceMode=True, maintenanceMessage="Retour bientôt")
        response = self.client.get("/api/offres/")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["code"], "maintenance")
        self.assertEqual(response.json()["detail"], "Retour bientôt")
        self.assertEqual(self.client.get("/api/platform/settings/").status_code, 200)
        self.authenticate(self.candidate)
        self.assertEqual(self.client.get("/api/users/me/").status_code, 200)
        self.assertEqual(self.client.patch("/api/users/me/", {"first_name": "Blocked"}, format="json").status_code, 503)
        self.assertEqual(self.client.get("/api/notifications/").status_code, 503)
        self.authenticate(self.admin)
        self.assertEqual(self.client.get("/api/administration/settings/").status_code, 200)
        result = self.client.patch("/api/administration/settings/", {"maintenanceMode": False}, format="json")
        self.assertEqual(result.status_code, 200)
        self.client.credentials()
        self.assertEqual(self.client.get("/api/offres/").status_code, 200)

    def test_login_remains_available_during_maintenance(self):
        self.config(maintenanceMode=True)
        response = self.client.post("/api/users/login/", {"email": self.admin.email, "password": "SettingsTest42!"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("tokens", response.data)

    @patch("ia.views.complete")
    def test_disabled_ai_never_calls_provider(self, complete):
        self.authenticate(self.candidate)
        self.config(aiEnabled=False)
        for tool in ["analyse-offre", "simulation-entretien", "conseiller-cv", "generer-cv", "questions-entretien"]:
            self.assertEqual(self.client.post("/api/ia/" + tool + "/", {}, format="json").status_code, 403)
        complete.assert_not_called()

    @patch("ia.views.complete")
    def test_each_individual_module_can_be_disabled(self, complete):
        self.authenticate(self.candidate)
        for key, tool in [("aiOfferAnalysis", "analyse-offre"), ("aiInterviewSimulation", "simulation-entretien"), ("aiCVAdvisor", "conseiller-cv"), ("aiRecruiterQuestions", "questions-entretien")]:
            self.config(**{key: False})
            self.assertEqual(self.client.post("/api/ia/" + tool + "/", {}, format="json").status_code, 403)
        complete.assert_not_called()

    def test_admin_notifications_are_private_and_readable(self):
        other = User.objects.create_user(username="other-admin", email="other-admin@test.fr", role="ADMIN")
        own = Notification.objects.create(user=self.admin, titre="Nouvelle offre", message="À valider")
        Notification.objects.create(user=other, titre="Privée", message="Autre compte")
        self.authenticate(self.admin)
        result = self.client.get("/api/notifications/")
        self.assertEqual([item["id"] for item in result.data], [own.id])
        self.assertEqual(self.client.post("/api/notifications/read_all/", {}, format="json").status_code, 200)
        own.refresh_from_db()
        self.assertTrue(own.is_read)
