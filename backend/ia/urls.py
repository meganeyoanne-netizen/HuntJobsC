from django.urls import path
from .views import IAView
urlpatterns = [path("<slug:outil>/", IAView.as_view())]
