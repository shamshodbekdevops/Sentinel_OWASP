from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Avg
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import ScanModel
from .services import is_valid_scan_url, start_scan_thread


def _require_authenticated_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Authentication required.'}, status=401)
    return None


@csrf_exempt
@require_POST
def register(request):
    name = request.POST.get('name', '').strip()
    email = request.POST.get('email', '').strip().lower()
    password = request.POST.get('password', '')

    if not name or not email or not password:
        return JsonResponse({'detail': 'Name, email and password are required.'}, status=400)

    if User.objects.filter(username=email).exists():
        return JsonResponse({'detail': 'User already exists.'}, status=409)

    user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
    login(request, user)
    return JsonResponse({'id': user.id, 'name': user.first_name or user.username, 'email': user.email}, status=201)


@csrf_exempt
@require_POST
def login_view(request):
    email = request.POST.get('email', '').strip().lower()
    password = request.POST.get('password', '')

    if not email or not password:
        return JsonResponse({'detail': 'Email and password are required.'}, status=400)

    user = authenticate(request, username=email, password=password)
    if user is None:
        return JsonResponse({'detail': 'Invalid credentials.'}, status=401)

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
    return JsonResponse({'detail': 'Logged out.'})


@csrf_exempt
@require_POST
def start_scan(request):
    url = request.POST.get('url', '').strip()
    user = request.user if request.user.is_authenticated else None

    if not user:
        return JsonResponse({'detail': 'Authentication required.'}, status=401)

    if not is_valid_scan_url(url):
        return JsonResponse({'detail': 'Only valid http/https URLs are allowed.'}, status=400)

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
        return JsonResponse({'detail': 'Scan not found.'}, status=404)

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
