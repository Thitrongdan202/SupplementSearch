from django.urls import path

from . import views

urlpatterns = [
    path("", views.MedicationSearchView.as_view(), name="search_medications"),
]