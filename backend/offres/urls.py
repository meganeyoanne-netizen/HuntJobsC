from django.urls import path

from .views import (
    AdminOffersListView,
    AdminOffersModerationListView,
    OffreApproveView,
    OffreArchiveView,
    OffreCreateView,
    OffreDeleteView,
    OffreDetailView,
    OffreListView,
    OffreModerationView,
    OffreReactivateView,
    OffreRejectView,
    OffreStatisticsView,
    OffreSubmitModerationView,
    OffreUpdateView,
    MyOffersView,
)

app_name = "offres"


urlpatterns = [

    # ========================================================
    # CANDIDAT / VISITEUR
    # ========================================================

    # Liste des offres publiées
    path(
        "",
        OffreListView.as_view(),
        name="offre-list",
    ),

    # Détail d'une offre
    path(
        "<int:pk>/",
        OffreDetailView.as_view(),
        name="offre-detail",
    ),


    # ========================================================
    # RECRUTEUR
    # ========================================================

    # Créer une offre
    path(
        "recruteur/create/",
        OffreCreateView.as_view(),
        name="offre-create",
    ),

    # Mes offres
    path(
        "recruteur/mes-offres/",
        MyOffersView.as_view(),
        name="mes-offres",
    ),

    # Modifier une offre
    path(
        "recruteur/<int:pk>/update/",
        OffreUpdateView.as_view(),
        name="offre-update",
    ),

    # Supprimer une offre
    path(
        "recruteur/<int:pk>/delete/",
        OffreDeleteView.as_view(),
        name="offre-delete",
    ),

    # Soumettre une offre à la modération
    path(
        "recruteur/<int:pk>/submit/",
        OffreSubmitModerationView.as_view(),
        name="offre-submit-moderation",
    ),

    # Archiver une offre
    path(
        "recruteur/<int:pk>/archive/",
        OffreArchiveView.as_view(),
        name="offre-archive",
    ),

    # Réactiver une offre
    path(
        "recruteur/<int:pk>/reactivate/",
        OffreReactivateView.as_view(),
        name="offre-reactivate",
    ),


    # ========================================================
    # ADMINISTRATION
    # ========================================================

    # Toutes les offres
    path(
        "admin/all/",
        AdminOffersListView.as_view(),
        name="admin-offres-list",
    ),

    # Offres en attente de modération
    path(
        "admin/pending/",
        AdminOffersModerationListView.as_view(),
        name="admin-offres-pending",
    ),

    # Statistiques des offres
    path(
        "admin/statistics/",
        OffreStatisticsView.as_view(),
        name="admin-offres-statistics",
    ),

    # Approuver une offre
    path(
        "admin/<int:pk>/approve/",
        OffreApproveView.as_view(),
        name="admin-offre-approve",
    ),

    # Rejeter une offre
    path(
        "admin/<int:pk>/reject/",
        OffreRejectView.as_view(),
        name="admin-offre-reject",
    ),

    # Modération générale
    path(
        "admin/<int:pk>/moderate/",
        OffreModerationView.as_view(),
        name="admin-offre-moderate",
    ),
]