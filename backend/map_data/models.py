from django.db import models

class District(models.Model):
    name = models.CharField(max_length=255)
    risk_score = models.FloatField(default=0.0) # Evaluated by AI weekly
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Crime(models.Model):
    CRIME_TYPES = (
        ('theft', 'Кража'),
        ('hooliganism', 'Хулиганство'),
        ('beating', 'Избиение'),
        ('administrative', 'Административное правонарушение'),
        ('other', 'Другое'),
    )
    title = models.CharField(max_length=255)
    crime_type = models.CharField(max_length=50, choices=CRIME_TYPES)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='crimes')
    latitude = models.FloatField()
    longitude = models.FloatField()
    date_committed = models.DateTimeField()
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.crime_type}"

class Camera(models.Model):
    name = models.CharField(max_length=255)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='cameras')
    latitude = models.FloatField()
    longitude = models.FloatField()
    stream_url = models.URLField(blank=True, null=True, help_text="URL for real-time video stream")
    
    def __str__(self):
        return self.name

class PoliceStation(models.Model):
    name = models.CharField(max_length=255)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='police_stations')
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    def __str__(self):
        return self.name

class SocialObject(models.Model):
    OBJECT_TYPES = (
        ('school', 'Школа'),
        ('kindergarten', 'Детский сад'),
        ('hospital', 'Больница'),
        ('other', 'Другое'),
    )
    name = models.CharField(max_length=255)
    object_type = models.CharField(max_length=50, choices=OBJECT_TYPES)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='social_objects')
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    def __str__(self):
        return f"{self.name} ({self.object_type})"
