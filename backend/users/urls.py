from django.urls import path
from .file_views import CVPrimaryView

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,

    CandidateProfileView,

    RecruiterProfileView,
    RecruiterCompanyView,
    RequestCompanyVerificationView,
    RequestCompanyModificationView,

    CVListCreateView,
    CVDetailView,

    DocumentListCreateView,
    DocumentDetailView,
)


app_name = "users"


urlpatterns = [
    path("cvs/<int:pk>/primary/", CVPrimaryView.as_view()),

    # ========================================================
    # AUTHENTIFICATION
    # ========================================================

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),


    # ========================================================
    # UTILISATEUR CONNECTÉ
    # ========================================================

    path(
        "me/",
        MeView.as_view(),
        name="me",
    ),


    # ========================================================
    # PROFIL CANDIDAT
    # ========================================================

    path(
        "candidate/profile/",
        CandidateProfileView.as_view(),
        name="candidate-profile",
    ),


    # ========================================================
    # PROFIL RECRUTEUR
    # ========================================================

    path(
        "recruiter/profile/",
        RecruiterProfileView.as_view(),
        name="recruiter-profile",
    ),


    # ========================================================
    # ENTREPRISE DU RECRUTEUR
    # ========================================================

    path(
        "recruiter/company/",
        RecruiterCompanyView.as_view(),
        name="recruiter-company",
    ),

    path(
        "recruiter/company/request-verification/",
        RequestCompanyVerificationView.as_view(),
        name="request-company-verification",
    ),

    path(
        "recruiter/company/request-modification/",
        RequestCompanyModificationView.as_view(),
        name="request-company-modification",
    ),


    # ========================================================
    # CV DU CANDIDAT
    # ========================================================

    path(
        "cvs/",
        CVListCreateView.as_view(),
        name="cv-list-create",
    ),

    path(
        "cvs/<int:pk>/",
        CVDetailView.as_view(),
        name="cv-detail",
    ),


    # ========================================================
    # DOCUMENTS DU CANDIDAT
    # ========================================================

    path(
        "documents/",
        DocumentListCreateView.as_view(),
        name="document-list-create",
    ),

    path(
        "documents/<int:pk>/",
        DocumentDetailView.as_view(),
        name="document-detail",
    ),
]