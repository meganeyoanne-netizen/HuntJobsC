from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
router = DefaultRouter()
router.register("entretiens", EntretienViewSet, basename="entretien")
router.register("notifications", NotificationViewSet, basename="notification")
router.register("alertes", AlerteViewSet, basename="alerte")
router.register("messages", MessageViewSet, basename="message")
router.register("generations", GenerationViewSet, basename="generation")
urlpatterns = [
    path("platform/settings/", PublicSettingsView.as_view()),
    path("", include(router.urls)),
    path("favoris/", FavoriView.as_view()),
    path("preferences/", PreferenceView.as_view()),
    path("dashboard/", DashboardView.as_view()),
    path("health/", HealthView.as_view()),
    path("candidats/", CandidateDirectory.as_view()),
    path("candidats/<int:pk>/", CandidateDirectory.as_view()),
    path("fichiers/<slug:kind>/<int:pk>/", PrivateFileView.as_view()),
    path("administration/statistics/", AdminStatisticsView.as_view()),
    path("administration/users/", AdminUsersView.as_view()),
    path("administration/users/<int:pk>/", AdminUsersView.as_view()),
    path("administration/entreprises/", AdminCompanyView.as_view()),
    path("administration/entreprises/<int:pk>/", AdminCompanyView.as_view()),
    path("administration/offres/<int:pk>/", AdminOfferAction.as_view()),
    path("administration/settings/", SettingsView.as_view()),
]
