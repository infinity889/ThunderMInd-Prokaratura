from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (DistrictViewSet, CrimeViewSet, CameraViewSet, 
                    PoliceStationViewSet, SocialObjectViewSet, ExcelUploadView)

router = DefaultRouter()
router.register(r'districts', DistrictViewSet)
router.register(r'crimes', CrimeViewSet)
router.register(r'cameras', CameraViewSet)
router.register(r'police-stations', PoliceStationViewSet)
router.register(r'social-objects', SocialObjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('upload-excel/', ExcelUploadView.as_view(), name='upload-excel'),
]
