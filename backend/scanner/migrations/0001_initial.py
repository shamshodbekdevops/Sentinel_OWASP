from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ScanModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.URLField()),
                ('score', models.IntegerField(default=0)),
                ('risk_data', models.JSONField(blank=True, default=dict)),
                ('findings', models.JSONField(blank=True, default=list)),
                ('status', models.CharField(choices=[('Pending', 'Pending'), ('Running', 'Running'), ('Completed', 'Completed'), ('Failed', 'Failed')], default='Pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='scans', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
