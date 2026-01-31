import os
from celery import Celery
from django.conf import settings  # <-- import settings to access CELERY_BEAT_SCHEDULE

# Set default Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")

# Load task modules from all registered Django apps
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# === Make Celery use the beat schedule defined in settings.py ===
app.conf.beat_schedule = getattr(settings, 'CELERY_BEAT_SCHEDULE', {})
app.conf.timezone = 'UTC'  # optional, but recommended
