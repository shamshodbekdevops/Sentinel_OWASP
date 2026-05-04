from .models import ScanModel


def global_stats(request):
    scans = ScanModel.objects.all()
    total_scans = scans.count()
    average_score = 0
    if total_scans:
        score_sum = sum(scan.score for scan in scans)
        average_score = round(score_sum / total_scans, 2)

    return {
        'global_scan_stats': {
            'total_scans': total_scans,
            'average_score': average_score,
        }
    }
