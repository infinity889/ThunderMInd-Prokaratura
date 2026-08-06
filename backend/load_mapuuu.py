import os
import django
import json
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from map_data.models import District

def load_districts():
    try:
        with open('mapuuu.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)

    features = data.get('features', [])
    count = 0
    for feature in features:
        props = feature.get('properties', {})
        geom = feature.get('geometry')
        name = props.get('NAME') or f"District {count+1}"
        
        # update_or_create to avoid duplicates if run multiple times
        district, created = District.objects.update_or_create(
            name=name,
            defaults={'coordinates': geom}
        )
        if created:
            print(f"Created: {name}")
        else:
            print(f"Updated: {name}")
        count += 1
        
    print(f"Successfully loaded {count} districts.")

if __name__ == '__main__':
    load_districts()
