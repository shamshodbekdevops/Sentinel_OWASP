import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react';
import { api, type DashboardData } from '../lib/api';

interface Report {
  id: number;
  title: string;
  date: string;
  type: 'Full Scan' | 'Quick Scan' | 'Compliance Report';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  findings: number;
  size: string;
}

const reports: Report[] = [
  { id: 1, title: 'example.com - Full Security Audit', date: '2026-05-04', type: 'Full Scan', severity: 'High', findings: 27, size: '2.4 MB' },
  { id: 2, title: 'app.example.com - Quick Security Check', date: '2026-05-03', type: 'Quick Scan', severity: 'Medium', findings: 24, size: '1.8 MB' },
  { id: 3, title: 'OWASP Top 10 Compliance Report', date: '2026-05-02', type: 'Compliance Report', severity: 'Low', findings: 14, size: '3.1 MB' },
  { id: 4, title: 'test.example.com - Full Security Audit', date: '2026-05-01', type: 'Full Scan', severity: 'Critical', findings: 40, size: '3.5 MB' },
  { id: 5, title: 'admin.example.com - Quick Security Check', date: '2026-04-30', type: 'Quick Scan', severity: 'Low', findings: 9, size: '1.2 MB' },
];

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

  useEffect(() => {
    api.dashboardData().then(setSummary).catch(() => undefined);
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-white text-2xl mb-2">Security Reports</h2>
        <p className="text-gray-400">Download and review detailed security analysis reports</p>
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
          <h3 className="text-white mb-1">Total Reports</h3>
          <p className="text-3xl text-[#3b82f6] font-bold">{reports.length}</p>
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
          <h3 className="text-white mb-1">Total Findings</h3>
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
          <h3 className="text-white mb-1">Latest Report</h3>
          <p className="text-sm text-[#22c55e]">{reports[0].date}</p>
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
            <h3 className="text-white">Available Reports</h3>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {reports.map((report, idx) => {
            const config = severityConfig[report.severity];

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="p-6 hover:bg-white/5 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <h4 className="text-white font-semibold">{report.title}</h4>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {report.date}
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        {report.type}
                      </span>
                      <span>{report.findings} findings</span>
                      <span>{report.size}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Severity:</span>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: config.bg,
                          color: config.text,
                          border: `1px solid ${config.border}40`,
                          boxShadow: `0 0 12px ${config.border}30`,
                        }}
                      >
                        {report.severity}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <motion.button
                      className="px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2"
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
                      <Download className="w-4 h-4" />
                      Download PDF
                    </motion.button>

                    <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm border border-white/10">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
