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


import os
import json
import re

class ExcelUploadView(views.APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file)
            csv_data = df.to_csv(index=False)

            groq_api_key = os.environ.get("GROQ_API_KEY")
            if not groq_api_key:
                from django.conf import settings
                groq_api_key = getattr(settings, 'GROQ_API_KEY', None)

            if not groq_api_key:
                return Response({"error": "GROQ_API_KEY is not configured on the server. Please set the environment variable."}, status=status.HTTP_400_BAD_REQUEST)

            from groq import Groq
            client = Groq(api_key=groq_api_key)

            prompt = f"""You are an assistant that extracts incident data from CSV. 
Please convert the following CSV data into a valid JSON array of incident objects. Do not output anything other than JSON array starting with [ and ending with ].
Requirements for JSON objects:
- "title": a string briefly describing the incident.
- "crime_type": must be one of ['theft', 'hooliganism', 'beating', 'administrative', 'other']. Classify based on the data.
- "district": a string name of the district (if missing, guess or write "Unknown").
- "latitude": a float between 46.95 and 47.25 (If CSV doesn't have it, invent a realistic one for Atyrau, Kazakhstan).
- "longitude": a float between 51.82 and 52.08 (If CSV doesn't have it, invent a realistic one).
- "description": a short string.

CSV Data:
{csv_data}
"""

            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that only outputs valid JSON arrays. Do not wrap with markdown code blocks if possible. Ensure output is strictly JSON.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
            )

            result_content = chat_completion.choices[0].message.content
            
            match = re.search(r'\[.*\]', result_content, re.DOTALL)
            if match:
                incidents = json.loads(match.group(0))
            else:
                incidents = json.loads(result_content)

            for row in incidents:
                district_name = row.get('district', 'Unknown')
                district, _ = District.objects.get_or_create(name=district_name)

                Crime.objects.create(
                    title=row.get('title', 'Unknown Crime'),
                    crime_type=row.get('crime_type', 'other'),
                    district=district,
                    latitude=float(row.get('latitude', 47.11)),
                    longitude=float(row.get('longitude', 51.92)),
                    date_committed=datetime.now(),
                    description=row.get('description', '')
                )

            return Response({"status": "Success, AI processed and uploaded data"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
