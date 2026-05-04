from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class ScanModel(models.Model):
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        RUNNING = 'Running', 'Running'
        COMPLETED = 'Completed', 'Completed'
        FAILED = 'Failed', 'Failed'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scans')
    url = models.URLField()
    score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=0)
    risk_data = models.JSONField(default=dict, blank=True)
    findings = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.url} ({self.status})'
