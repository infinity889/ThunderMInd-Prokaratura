from django.contrib import admin
from .models import District, Crime, Camera, PoliceStation, SocialObject

admin.site.register(District)
admin.site.register(Crime)
admin.site.register(Camera)
admin.site.register(PoliceStation)
admin.site.register(SocialObject)
