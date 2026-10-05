from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView
from users.account_views import PasswordChangeView, PasswordResetView, PasswordResetConfirmView
from plateforme.views import PublicFileView
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/users/token/refresh/", TokenRefreshView.as_view()),
    path("api/users/password-change/", PasswordChangeView.as_view()),
    path("api/users/password-reset/", PasswordResetView.as_view()),
    path("api/users/password-reset-confirm/", PasswordResetConfirmView.as_view()),
    path("api/offres/", include("offres.urls")),
    path("api/candidatures/", include("candidatures.urls")),
    path("api/ia/", include("ia.urls")),
    path("api/", include("plateforme.urls")),
    path("media/<path:path>", PublicFileView.as_view()),
]
