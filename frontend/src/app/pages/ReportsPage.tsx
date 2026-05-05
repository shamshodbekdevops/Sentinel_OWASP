import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { api, type DashboardData, type ScanSummary } from '../lib/api';
import { ScanDetailsDialog } from '../components/ScanDetailsDialog';

const severityConfig = {
  Critical: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: '#ef4444' },
  High: { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316', border: '#f97316' },
  Medium: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308', border: '#eab308' },
  Low: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e', border: '#22c55e' },
};

export function ReportsPage() {
  const [summary, setSummary] = useState<DashboardData>({
    total_scans: 0,
    average_score: 0,
    total_findings: 0,
    completed_scans: 0,
    failed_scans: 0,
  });
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanSummary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashData, historyData] = await Promise.all([
          api.dashboardData(),
          api.scanHistory(),
        ]);
        setSummary(dashData);
        setScans(historyData.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadPDF = async (scanId: number) => {
    try {
      setDownloading(scanId);
      await api.downloadPDF(scanId);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setDownloading(null);
    }
  };

  const getHighestSeverity = (riskData: Record<string, number>): 'Critical' | 'High' | 'Medium' | 'Low' => {
    if (riskData.High > 0) return 'High';
    if (riskData.Medium > 0) return 'Medium';
    if (riskData.Low > 0) return 'Low';
    return 'Low';
  };

  const getLatestDate = () => {
    if (scans.length === 0) return 'N/A';
    return new Date(scans[0].created_at).toLocaleDateString();
  };

  const translateStatus = (status: string) => {
    if (status === 'Completed') return 'Tugallandi';
    if (status === 'Failed') return 'Muvaffaqiyatsiz';
    if (status === 'Pending') return 'Kutilmoqda';
    if (status === 'Running') return 'Ishlamoqda';
    return status;
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-white text-2xl mb-2">Xavfsizlik hisobotlari</h2>
        <p className="text-gray-400">Tafsilotli xavfsizlik tahlil hisobotlarini yuklab oling va ko‘rib chiqing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-xl backdrop-blur-xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <FileText className="w-10 h-10 text-[#3b82f6] mb-4" style={{ filter: 'drop-shadow(0 0 8px #3b82f6)' }} />
          <h3 className="text-white mb-1">Jami hisobotlar</h3>
          <p className="text-3xl text-[#3b82f6] font-bold">{summary.total_scans}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-xl backdrop-blur-xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <AlertCircle className="w-10 h-10 text-[#eab308] mb-4" style={{ filter: 'drop-shadow(0 0 8px #eab308)' }} />
          <h3 className="text-white mb-1">Jami findinglar</h3>
          <p className="text-3xl text-[#eab308] font-bold">{summary.total_findings}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-xl backdrop-blur-xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Calendar className="w-10 h-10 text-[#22c55e] mb-4" style={{ filter: 'drop-shadow(0 0 8px #22c55e)' }} />
          <h3 className="text-white mb-1">So‘nggi hisobot</h3>
          <p className="text-sm text-[#22c55e]">{getLatestDate()}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded-xl backdrop-blur-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="text-white">Mavjud hisobotlar</h3>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-6 flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Hisobotlar yuklanmoqda...
            </div>
          ) : scans.length === 0 ? (
            <div className="p-6 text-gray-400">Hozircha scan yo‘q. Hisobotlarni ko‘rish uchun yangi scan boshlang.</div>
          ) : (
            scans.map((scan, idx) => {
              const severity = getHighestSeverity(scan.risk_data || {});
              const config = severityConfig[severity];
              const date = new Date(scan.created_at);

              return (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  className="p-6 hover:bg-white/5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h4 className="text-white font-semibold">{scan.url}</h4>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {date.toLocaleDateString()} {date.toLocaleTimeString()}
                        </span>
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          {translateStatus(scan.status)}
                        </span>
                        <span>{scan.findings?.length || 0} ta topilma</span>
                        <span>Ball: {scan.score}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Jiddiylik:</span>
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: config.bg,
                            color: config.text,
                            border: `1px solid ${config.border}40`,
                            boxShadow: `0 0 12px ${config.border}30`,
                          }}
                        >
                          {severity}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <motion.button
                        onClick={() => handleDownloadPDF(scan.id)}
                        disabled={downloading === scan.id}
                        className="px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {downloading === scan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {downloading === scan.id ? 'Yuklanmoqda...' : 'PDF yuklab olish'}
                      </motion.button>

                      <button
                        onClick={() => setSelectedScan(scan)}
                        className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm border border-white/10"
                      >
                        Tafsilotlarni ko‘rish
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      <ScanDetailsDialog
        open={Boolean(selectedScan)}
        onOpenChange={(open) => !open && setSelectedScan(null)}
        scan={selectedScan}
        onDownloadPdf={async (scanId) => handleDownloadPDF(scanId)}
      />
    </div>
  );
}
