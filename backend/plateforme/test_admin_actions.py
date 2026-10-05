from datetime import timedelta
from unittest.mock import patch
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User, ProfilRecruteur, Entreprise
from offres.models import Offre
from .models import JournalAdmin

@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class AdminActionTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="actions-admin", email="actions-admin@test.fr", role="ADMIN")
        self.recruiter = User.objects.create_user(username="actions-recruiter", email="actions-recruiter@test.fr", role="RECRUTEUR")
        self.company = Entreprise.objects.create(profil_recruteur=ProfilRecruteur.objects.create(user=self.recruiter), nom="Test", verification_status="PENDING")
        self.offer = Offre.objects.create(titre="Développeur", description="Poste React", entreprise=self.company, recruteur=self.recruiter, localisation="Douala", type_contrat="CDI", date_limite=timezone.localdate()+timedelta(days=10), diplome_requis="Licence", competences=["React"])
        self.client.force_authenticate(self.admin)

    def action(self, name):
        return self.client.post(f"/api/administration/offres/{self.offer.pk}/", {"action": name, "motif": "Test administrateur"}, format="json")

    def approve(self):
        return self.client.post(f"/api/offres/admin/{self.offer.pk}/approve/", {}, format="json")

    def test_draft_can_be_validated_then_blocked_then_reactivated(self):
        self.assertEqual(self.approve().status_code, 200)
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.statut, "PUBLIEE")
        self.assertEqual(self.action("suspend").status_code, 200)
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.statut, "SUSPENDUE")
        self.assertEqual(self.action("reactivate").status_code, 200)
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.statut, "PUBLIEE")
        self.assertEqual(self.offer.motif_suspension, "")
        self.assertEqual(list(JournalAdmin.objects.filter(cible_type="offer", cible_id=self.offer.pk).order_by("pk").values_list("action", flat=True)), ["approve", "suspend", "reactivate"])

    def test_blocked_draft_returns_to_draft_without_implicit_approval(self):
        self.assertEqual(self.action("suspend").status_code, 200)
        self.assertEqual(self.approve().status_code, 400)
        self.assertEqual(self.action("reactivate").status_code, 200)
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.statut, "BROUILLON")
        self.assertEqual(self.offer.moderation_status, "NON_SOUMISE")

    def test_invalid_transitions_and_incomplete_draft_are_rejected(self):
        self.assertEqual(self.action("reactivate").status_code, 400)
        self.offer.competences = []
        self.offer.save()
        self.assertEqual(self.approve().status_code, 400)
        self.assertEqual(self.action("suspend").status_code, 200)
        self.assertEqual(self.action("suspend").status_code, 400)

    def test_expired_offer_cannot_be_reactivated(self):
        self.assertEqual(self.action("suspend").status_code, 200)
        self.offer.date_limite = timezone.localdate()-timedelta(days=1)
        self.offer.save()
        self.assertEqual(self.action("reactivate").status_code, 400)

    def test_any_unsuspended_recruiter_can_be_suspended_and_reactivated(self):
        token = str(RefreshToken.for_user(self.recruiter).access_token)
        url = f"/api/administration/entreprises/{self.company.pk}/"
        self.assertEqual(self.client.post(url, {"action": "suspend"}, format="json").status_code, 200)
        self.company.refresh_from_db()
        self.recruiter.refresh_from_db()
        self.assertTrue(self.recruiter.is_suspended)
        self.assertTrue(self.company.is_suspended)
        self.assertEqual(self.company.verification_status, "PENDING")
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)
        self.assertEqual(self.client.get("/api/users/me/").status_code, 401)
        self.client.credentials()
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post(url, {"action": "reactivate"}, format="json").status_code, 200)
        self.company.refresh_from_db()
        self.recruiter.refresh_from_db()
        self.assertFalse(self.company.is_suspended)
        self.assertFalse(self.recruiter.is_suspended)
        self.assertEqual(self.company.verification_status, "PENDING")

    def test_non_admin_cannot_moderate(self):
        self.client.force_authenticate(self.recruiter)
        self.assertEqual(self.action("suspend").status_code, 403)
        self.assertEqual(self.approve().status_code, 403)

    @patch("plateforme.views.record_admin", side_effect=RuntimeError("Audit unavailable"))
    def test_offer_change_rolls_back_if_audit_fails(self, record):
        with self.assertRaises(RuntimeError):
            self.action("suspend")
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.statut, "BROUILLON")
