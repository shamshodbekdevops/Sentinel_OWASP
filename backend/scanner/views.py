from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Avg
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from datetime import datetime

from .models import ScanModel
from .services import is_valid_scan_url, start_scan_thread


def _require_authenticated_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Avtorizatsiya talab qilinadi.'}, status=401)
    return None


@csrf_exempt
@require_POST
def register(request):
    name = request.POST.get('name', '').strip()
    email = request.POST.get('email', '').strip().lower()
    password = request.POST.get('password', '')

    if not name or not email or not password:
        return JsonResponse({'detail': 'Ism, email va parol kiritilishi shart.'}, status=400)

    if User.objects.filter(username=email).exists():
        return JsonResponse({'detail': 'Bunday foydalanuvchi allaqachon mavjud.'}, status=409)

    user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
    login(request, user)
    return JsonResponse({'id': user.id, 'name': user.first_name or user.username, 'email': user.email}, status=201)


@csrf_exempt
@require_POST
def login_view(request):
    email = request.POST.get('email', '').strip().lower()
    password = request.POST.get('password', '')

    if not email or not password:
        return JsonResponse({'detail': 'Email va parol kiritilishi shart.'}, status=400)

    user = authenticate(request, username=email, password=password)
    if user is None:
        return JsonResponse({'detail': 'Email yoki parol noto‘g‘ri.'}, status=401)

    login(request, user)
    return JsonResponse({'id': user.id, 'name': user.first_name or user.username, 'email': user.email})


@require_GET
def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'user': None}, status=200)

    return JsonResponse(
        {
            'user': {
                'id': request.user.id,
                'name': request.user.first_name or request.user.username,
                'email': request.user.email,
            }
        }
    )


@csrf_exempt
@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({'detail': 'Tizimdan chiqildi.'})


@csrf_exempt
@require_POST
def start_scan(request):
    url = request.POST.get('url', '').strip()
    user = request.user if request.user.is_authenticated else None

    if not user:
        return JsonResponse({'detail': 'Avtorizatsiya talab qilinadi.'}, status=401)

    if not is_valid_scan_url(url):
        return JsonResponse({'detail': 'Faqat yaroqli http/https URL manzillariga ruxsat beriladi.'}, status=400)

    scan = ScanModel.objects.create(
        user=user,
        url=url,
        status=ScanModel.Status.PENDING,
        risk_data={},
        findings=[],
        score=0,
    )
    start_scan_thread(scan.id)
    return JsonResponse({'id': scan.id, 'status': scan.status}, status=200)


@require_GET
def scan_status(request, scan_id: int):
    try:
        scan = ScanModel.objects.get(pk=scan_id)
    except ScanModel.DoesNotExist:
        return JsonResponse({'detail': 'Scan topilmadi.'}, status=404)

    return JsonResponse(
        {
            'id': scan.id,
            'url': scan.url,
            'score': scan.score,
            'risk_data': scan.risk_data,
            'findings': scan.findings,
            'status': scan.status,
        }
    )


@require_GET
def dashboard_data(request):
    scans = ScanModel.objects.all()
    if request.user.is_authenticated:
        scans = scans.filter(user=request.user)
    total_scans = scans.count()
    average_score = scans.aggregate(average=Avg('score'))['average'] or 0
    total_findings = sum(len(scan.findings or []) for scan in scans)
    return JsonResponse(
        {
            'total_scans': total_scans,
            'average_score': round(float(average_score), 2),
            'total_findings': total_findings,
            'completed_scans': scans.filter(status=ScanModel.Status.COMPLETED).count(),
            'failed_scans': scans.filter(status=ScanModel.Status.FAILED).count(),
        }
    )


@require_GET
def scan_history(request):
    auth_error = _require_authenticated_user(request)
    if auth_error:
        return auth_error

    scans = ScanModel.objects.filter(user=request.user).order_by('-created_at')
    return JsonResponse(
        {
            'results': [
                {
                    'id': scan.id,
                    'url': scan.url,
                    'score': scan.score,
                    'status': scan.status,
                    'risk_data': scan.risk_data,
                    'findings': scan.findings,
                    'created_at': scan.created_at.isoformat(),
                }
                for scan in scans
            ]
        }
    )


@require_GET
def generate_pdf_report(request, scan_id: int):
    try:
        scan = ScanModel.objects.get(pk=scan_id)
    except ScanModel.DoesNotExist:
        return JsonResponse({'detail': 'Scan not found.'}, status=404)

    # PDF yaratish
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
    )
    story.append(Paragraph('Xavfsizlik audit hisoboti', title_style))
    story.append(Spacer(1, 0.2 * inch))

    # Scan info
    info_style = ParagraphStyle(
        'Info',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#666666'),
    )
    story.append(Paragraph(f'<b>Nishon URL:</b> {scan.url}', info_style))
    story.append(Paragraph(f'<b>Scan sanasi:</b> {scan.created_at.strftime("%Y-%m-%d %H:%M:%S")}', info_style))
    story.append(Paragraph(f'<b>Holat:</b> {scan.status}', info_style))
    story.append(Spacer(1, 0.3 * inch))

    # Score
    score_style = ParagraphStyle(
        'Score',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#059669'),
    )
    story.append(Paragraph(f'Xavfsizlik balli: {scan.score}/100', score_style))
    story.append(Spacer(1, 0.2 * inch))

    # Risk Summary
    risk_style = ParagraphStyle(
        'Risk',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#1e40af'),
    )
    story.append(Paragraph('Risk xulosasi', risk_style))
    
    risk_data = scan.risk_data or {}
    risk_table_data = [
        ['Risk darajasi', 'Son'],
        ['High', str(risk_data.get('High', 0))],
        ['Medium', str(risk_data.get('Medium', 0))],
        ['Low', str(risk_data.get('Low', 0))],
    ]
    
    risk_table = Table(risk_table_data, colWidths=[2 * inch, 1.5 * inch])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    story.append(risk_table)
    story.append(Spacer(1, 0.3 * inch))

    # Findings
    if scan.findings:
        findings_style = ParagraphStyle(
            'Findings',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#1e40af'),
        )
        story.append(Paragraph('Topilmalar', findings_style))
        story.append(Spacer(1, 0.1 * inch))

        for finding in scan.findings:
            story.append(Paragraph(f"<b>{finding.get('title', 'Unknown')}</b>", styles['Normal']))
            story.append(Paragraph(f"Jiddiylik: {finding.get('severity', 'N/A')}", info_style))
            story.append(Paragraph(f"Tafsilot: {finding.get('detail', 'N/A')}", info_style))
            story.append(Spacer(1, 0.1 * inch))

    doc.build(story)
    pdf_buffer.seek(0)

    response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="scan-report-{scan_id}.pdf"'
    return response
