from django.urls import path

from . import views

urlpatterns = [
    path('api/auth/register/', views.register, name='register'),
    path('api/auth/login/', views.login_view, name='login'),
    path('api/auth/me/', views.me, name='me'),
    path('api/auth/logout/', views.logout_view, name='logout'),
    path('api/scan/start/', views.start_scan, name='start_scan'),
    path('api/scan/status/<int:scan_id>/', views.scan_status, name='scan_status'),
    path('api/scan/<int:scan_id>/pdf/', views.generate_pdf_report, name='generate_pdf_report'),
    path('api/dashboard/data/', views.dashboard_data, name='dashboard_data'),
    path('api/scans/', views.scan_history, name='scan_history'),
]
