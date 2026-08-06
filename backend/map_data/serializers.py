from rest_framework import serializers
from .models import District, Crime, Camera, PoliceStation, SocialObject

class CrimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crime
        fields = '__all__'

class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = '__all__'

class PoliceStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PoliceStation
        fields = '__all__'

class SocialObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialObject
        fields = '__all__'

class DistrictSerializer(serializers.ModelSerializer):
    crimes = CrimeSerializer(many=True, read_only=True)
    cameras = CameraSerializer(many=True, read_only=True)
    police_stations = PoliceStationSerializer(many=True, read_only=True)
    social_objects = SocialObjectSerializer(many=True, read_only=True)

    class Meta:
        model = District
        fields = '__all__'
