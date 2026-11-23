from django.urls import path
from .views import WeeklyAnalysisView, DistrictRatingView

urlpatterns = [
    path('generate-analysis/', WeeklyAnalysisView.as_view(), name='generate-analysis'),
    path('ratings/', DistrictRatingView.as_view(), name='district-ratings'),
]
