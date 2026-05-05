import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Calendar, ExternalLink } from 'lucide-react';
import { api, type ScanSummary } from '../lib/api';
import { ScanDetailsDialog } from '../components/ScanDetailsDialog';

const severityConfig = {
  Critical: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: '#ef4444' },
  High: { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316', border: '#f97316' },
  Medium: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308', border: '#eab308' },
  Low: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e', border: '#22c55e' },
};

export function ScanHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [records, setRecords] = useState<ScanSummary[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanSummary | null>(null);

  useEffect(() => {
    api.scanHistory()
      .then((response) => {
        setRecords(response.results || []);
      })
      .catch(() => setRecords([]));
  }, []);

  const filteredScans = useMemo(() => records.filter(scan => {
    const matchesSearch = scan.url.toLowerCase().includes(searchTerm.toLowerCase());
    const riskData = scan.risk_data || {};
    const matchesFilter = filterRisk === 'all' ||
      (filterRisk === 'critical' && Number(riskData.Critical || 0) > 0) ||
      (filterRisk === 'high' && Number(riskData.High || 0) > 0) ||
      (filterRisk === 'medium' && Number(riskData.Medium || 0) > 0) ||
      (filterRisk === 'low' && Number(riskData.Low || 0) > 0);

    return matchesSearch && matchesFilter;
  }), [filterRisk, records, searchTerm]);

  const getRiskLevel = (scan: ScanSummary): 'Critical' | 'High' | 'Medium' | 'Low' => {
    const riskData = scan.risk_data || {};
    if (Number(riskData.Critical || 0) > 0) return 'Critical';
    if (Number(riskData.High || 0) > 0) return 'High';
    if (Number(riskData.Medium || 0) > 0) return 'Medium';
    return 'Low';
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
        <h2 className="text-white text-2xl mb-2">Scan tarixi</h2>
        <p className="text-gray-400">Oldingi xavfsizlik scanlarini ko‘ring va tahlil qiling</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="URL bo‘yicha qidirish..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#0f172a] border border-white/10 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-[#3b82f6]"
            style={{
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 24px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(0, 0, 0, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
            }}
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as any)}
              className="pl-10 pr-8 py-3 rounded-lg bg-[#0f172a] border border-white/10 text-white transition-all duration-300 focus:outline-none focus:border-[#3b82f6] appearance-none cursor-pointer"
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
            >
              <option value="all">Barcha risk darajalari</option>
              <option value="critical">Faqat Critical</option>
              <option value="high">Faqat High</option>
              <option value="medium">Faqat Medium</option>
              <option value="low">Faqat Low</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-xl backdrop-blur-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#3b82f6]" />
              <h3 className="text-white">So‘nggi scanlar</h3>
            </div>
            <span className="text-gray-400 text-sm">{filteredScans.length} ta natija</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm text-gray-400">ID</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Nishon URL</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Sana va vaqt</th>
                <th className="px-6 py-4 text-center text-sm text-gray-400">Critical</th>
                <th className="px-6 py-4 text-center text-sm text-gray-400">High</th>
                <th className="px-6 py-4 text-center text-sm text-gray-400">Medium</th>
                <th className="px-6 py-4 text-center text-sm text-gray-400">Low</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Holat</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Risk darajasi</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((scan, idx) => {
                const riskLevel = getRiskLevel(scan);
                const config = severityConfig[riskLevel];
                const riskData = scan.risk_data || {};
                const date = new Date(scan.created_at);

                return (
                  <motion.tr
                    key={scan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 transition-all duration-200 cursor-pointer"
                    whileHover={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <td className="px-6 py-4 text-gray-300">#{scan.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-sm">{scan.url}</span>
                        <ExternalLink className="w-3 h-3 text-gray-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {date.toISOString().split('T')[0]} {date.toTimeString().slice(0, 5)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${Number(riskData.Critical || 0) > 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-500'}`}>
                        {Number(riskData.Critical || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${Number(riskData.High || 0) > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700 text-gray-500'}`}>
                        {Number(riskData.High || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${Number(riskData.Medium || 0) > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-500'}`}>
                        {Number(riskData.Medium || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${Number(riskData.Low || 0) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                        {Number(riskData.Low || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {translateStatus(scan.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: config.bg,
                          color: config.text,
                          border: `1px solid ${config.border}40`,
                          boxShadow: `0 0 12px ${config.border}30`,
                        }}
                      >
                        {riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedScan(scan)}
                        className="text-[#3b82f6] hover:text-[#60a5fa] text-sm transition-colors"
                      >
                        Tafsilotlarni ko‘rish
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <ScanDetailsDialog
        open={Boolean(selectedScan)}
        onOpenChange={(open) => !open && setSelectedScan(null)}
        scan={selectedScan}
        onDownloadPdf={async (scanId) => api.downloadPDF(scanId)}
      />
    </div>
  );
}
