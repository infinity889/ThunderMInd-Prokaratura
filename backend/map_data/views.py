from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import District, Crime, Camera, PoliceStation, SocialObject
from .serializers import (DistrictSerializer, CrimeSerializer, CameraSerializer,
                          PoliceStationSerializer, SocialObjectSerializer)
from users.permissions import IsAdminOrReadOnly, IsAdminUser
import pandas as pd
from datetime import datetime


class DistrictViewSet(viewsets.ModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [IsAdminOrReadOnly]


class CrimeViewSet(viewsets.ModelViewSet):
    queryset = Crime.objects.all()
    serializer_class = CrimeSerializer
    permission_classes = [IsAdminOrReadOnly]


class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    permission_classes = [IsAdminOrReadOnly]


class PoliceStationViewSet(viewsets.ModelViewSet):
    queryset = PoliceStation.objects.all()
    serializer_class = PoliceStationSerializer
    permission_classes = [IsAdminOrReadOnly]


class SocialObjectViewSet(viewsets.ModelViewSet):
    queryset = SocialObject.objects.all()
    serializer_class = SocialObjectSerializer
    permission_classes = [IsAdminOrReadOnly]


class ExcelUploadView(views.APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file)

            for index, row in df.iterrows():
                district_name = row.get('district', 'Unknown')
                district, _ = District.objects.get_or_create(name=district_name)

                Crime.objects.create(
                    title=row.get('title', 'Unknown Crime'),
                    crime_type=row.get('crime_type', 'other'),
                    district=district,
                    latitude=row.get('latitude', 0.0),
                    longitude=row.get('longitude', 0.0),
                    date_committed=datetime.now(),
                    description=row.get('description', '')
                )

            return Response({"status": "Success, data uploaded"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
