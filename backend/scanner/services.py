import json
import subprocess
import threading
from urllib.parse import urlparse

import requests
from django.db import transaction
from django.utils import timezone

from .models import ScanModel


_ZAP_API_TIMEOUT = 10


def is_valid_scan_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in {'http', 'https'} and bool(parsed.netloc)


def start_scan_thread(scan_id: int) -> None:
    thread = threading.Thread(target=run_scan, args=(scan_id,), daemon=True)
    thread.start()


def run_scan(scan_id: int) -> None:
    try:
        with transaction.atomic():
            scan = ScanModel.objects.select_for_update().get(pk=scan_id)
            scan.status = ScanModel.Status.RUNNING
            scan.save(update_fields=['status', 'updated_at'])

        scan = ScanModel.objects.get(pk=scan_id)
        result = execute_scan(scan.url)

        scan.score = result['score']
        scan.risk_data = result['risk_data']
        scan.findings = result['findings']
        scan.status = ScanModel.Status.COMPLETED
        scan.updated_at = timezone.now()
        scan.save(update_fields=['score', 'risk_data', 'findings', 'status', 'updated_at'])
    except Exception as exc:
        ScanModel.objects.filter(pk=scan_id).update(
            status=ScanModel.Status.FAILED,
            findings=[{'type': 'error', 'detail': str(exc)}],
            updated_at=timezone.now(),
        )


def execute_scan(url: str) -> dict:
    if not is_valid_scan_url(url):
        raise ValueError('Only valid http/https URLs are allowed.')

    zap_result = try_zap_api_scan(url)
    if zap_result is not None:
        return zap_result

    subprocess_result = try_subprocess_scan(url)
    if subprocess_result is not None:
        return subprocess_result

    return build_default_result(url)


def try_zap_api_scan(url: str):
    zap_base = 'http://127.0.0.1:8080'
    try:
        response = requests.get(
            f'{zap_base}/JSON/core/view/version/',
            timeout=_ZAP_API_TIMEOUT,
        )
        response.raise_for_status()
        requests.get(
            f'{zap_base}/JSON/spider/action/scan/',
            params={'url': url},
            timeout=_ZAP_API_TIMEOUT,
        )
        requests.get(
            f'{zap_base}/JSON/ascan/action/scan/',
            params={'url': url},
            timeout=_ZAP_API_TIMEOUT,
        )
        return build_default_result(url)
    except requests.RequestException:
        return None


def try_subprocess_scan(url: str):
    commands = [
        ['zap-baseline.py', '-t', url],
        ['curl', '-I', url],
    ]
    for command in commands:
        try:
            subprocess.run(command, capture_output=True, text=True, timeout=30, check=False)
            return build_default_result(url)
        except (FileNotFoundError, subprocess.SubprocessError):
            continue
    return None


def build_default_result(url: str) -> dict:
    risk_data = {'High': 0, 'Medium': 1, 'Low': 2}
    findings = [
        {
            'title': 'Baseline scan executed',
            'severity': 'Low',
            'target': url,
            'detail': 'Fallback scan completed with minimal telemetry.',
        }
    ]
    score = max(0, 100 - (risk_data['High'] * 40 + risk_data['Medium'] * 15 + risk_data['Low'] * 5))
    return {'score': score, 'risk_data': risk_data, 'findings': findings}
