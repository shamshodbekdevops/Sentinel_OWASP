from django.contrib import admin

from .models import ScanModel


@admin.register(ScanModel)
class ScanModelAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'url', 'score', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('url', 'user__username')
