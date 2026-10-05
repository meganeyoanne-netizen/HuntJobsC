from django.urls import path
from .views import CandidatureList, CandidatureDetail
urlpatterns = [path("", CandidatureList.as_view()), path("<int:pk>/", CandidatureDetail.as_view())]
