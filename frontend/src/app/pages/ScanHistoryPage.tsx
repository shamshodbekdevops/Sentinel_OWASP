import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Calendar, ExternalLink } from 'lucide-react';
import { api, type ScanSummary } from '../lib/api';

interface ScanRecord {
  id: number;
  url: string;
  date: string;
  time: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  status: 'Completed' | 'In Progress' | 'Failed';
}

const severityConfig = {
  Critical: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: '#ef4444' },
  High: { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316', border: '#f97316' },
  Medium: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308', border: '#eab308' },
  Low: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e', border: '#22c55e' },
};

export function ScanHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [records, setRecords] = useState<ScanRecord[]>([]);

  useEffect(() => {
    api.scanHistory()
      .then((response) => {
        const mapped = response.results.map((scan: ScanSummary) => {
          const riskData = scan.risk_data || {};
          return {
            id: scan.id,
            url: scan.url,
            date: new Date(scan.created_at).toISOString().split('T')[0],
            time: new Date(scan.created_at).toTimeString().slice(0, 5),
            critical: 0,
            high: Number(riskData.High || 0),
            medium: Number(riskData.Medium || 0),
            low: Number(riskData.Low || 0),
            status: scan.status === 'Running' ? 'In Progress' : (scan.status as 'Completed' | 'In Progress' | 'Failed'),
          };
        });

        setRecords(mapped);
      })
      .catch(() => setRecords([]));
  }, []);

  const filteredScans = useMemo(() => records.filter(scan => {
    const matchesSearch = scan.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'all' ||
      (filterRisk === 'critical' && scan.critical > 0) ||
      (filterRisk === 'high' && scan.high > 0) ||
      (filterRisk === 'medium' && scan.medium > 0) ||
      (filterRisk === 'low' && scan.low > 0);

    return matchesSearch && matchesFilter;
  }), [filterRisk, records, searchTerm]);

  const getRiskLevel = (scan: ScanRecord): 'Critical' | 'High' | 'Medium' | 'Low' => {
    if (scan.critical > 0) return 'Critical';
    if (scan.high > 0) return 'High';
    if (scan.medium > 0) return 'Medium';
    return 'Low';
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-white text-2xl mb-2">Scan History</h2>
        <p className="text-gray-400">View and analyze past security scans</p>
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
            placeholder="Search by URL..."
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
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
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
              <h3 className="text-white">Recent Scans</h3>
            </div>
            <span className="text-gray-400 text-sm">{filteredScans.length} results</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm text-gray-400">ID</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Target URL</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Date & Time</th>
                <th className="px-6 py-4 text-center text-sm text-gray-400">Critical</th>
                <th className="px-6 py-4 text-center text-sm text-gray-400">High</th>
                <th className="px-6 py-4 text-center text-sm text-gray-400">Medium</th>
                <th className="px-6 py-4 text-center text-sm text-gray-400">Low</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Risk Level</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((scan, idx) => {
                const riskLevel = getRiskLevel(scan);
                const config = severityConfig[riskLevel];

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
                      {scan.date} {scan.time}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${scan.critical > 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-500'}`}>
                        {scan.critical}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${scan.high > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700 text-gray-500'}`}>
                        {scan.high}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${scan.medium > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-500'}`}>
                        {scan.medium}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${scan.low > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                        {scan.low}
                      </span>
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
                      <button className="text-[#3b82f6] hover:text-[#60a5fa] text-sm transition-colors">
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
