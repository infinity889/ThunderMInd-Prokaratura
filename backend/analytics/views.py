from rest_framework.views import APIView
from rest_framework.response import Response
from map_data.models import District
import random

class WeeklyAnalysisView(APIView):
    def post(self, request):
        # AI analysis logic here (in future)
        # For now, generate a random risk score and return
        districts = District.objects.all()
        for district in districts:
            district.risk_score = round(random.uniform(0.0, 10.0), 2)
            district.save()
            
        return Response({"status": "Success", "message": "Weekly analysis generated using AI (Mocked)"})

class DistrictRatingView(APIView):
    def get(self, request):
        # Returns regions ordered by danger level (from most dangerous to least)
        districts = District.objects.all().order_by('-risk_score')
        data = [
            {
                "id": d.id,
                "name": d.name,
                "risk_score": d.risk_score
            } for d in districts
        ]
        return Response(data)
