import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface Result {
  id: number;
  vulnerability: string;
  location: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
}

const results: Result[] = [
  { id: 1, vulnerability: 'SQL Injection', location: '/api/users', severity: 'Critical', status: 'Active' },
  { id: 2, vulnerability: 'XSS Vulnerability', location: '/search', severity: 'High', status: 'Active' },
  { id: 3, vulnerability: 'Missing CSRF Token', location: '/login', severity: 'High', status: 'Active' },
  { id: 4, vulnerability: 'Weak Password Policy', location: '/register', severity: 'Medium', status: 'Pending' },
  { id: 5, vulnerability: 'Information Disclosure', location: '/error', severity: 'Low', status: 'Resolved' },
  { id: 6, vulnerability: 'Outdated Dependencies', location: 'package.json', severity: 'Medium', status: 'Active' },
];

const severityConfig = {
  Critical: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: '#ef4444' },
  High: { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316', border: '#f97316' },
  Medium: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308', border: '#eab308' },
  Low: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e', border: '#22c55e' },
};

export function ResultsTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="rounded-xl backdrop-blur-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#eab308]" />
          <h3 className="text-white">So‘nggi zaifliklar</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-sm text-gray-400">ID</th>
              <th className="px-6 py-4 text-left text-sm text-gray-400">Zaiflik</th>
              <th className="px-6 py-4 text-left text-sm text-gray-400">Manzil</th>
              <th className="px-6 py-4 text-left text-sm text-gray-400">Jiddiylik</th>
              <th className="px-6 py-4 text-left text-sm text-gray-400">Holat</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <motion.tr
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
                className="border-b border-white/5 transition-all duration-200 cursor-pointer"
                whileHover={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                <td className="px-6 py-4 text-gray-300">#{result.id}</td>
                <td className="px-6 py-4 text-white">{result.vulnerability}</td>
                <td className="px-6 py-4 text-gray-400 font-mono text-sm">{result.location}</td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: severityConfig[result.severity].bg,
                      color: severityConfig[result.severity].text,
                      border: `1px solid ${severityConfig[result.severity].border}40`,
                      boxShadow: `0 0 12px ${severityConfig[result.severity].border}30`,
                    }}
                  >
                    {result.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {result.status === 'Active' ? 'Faol' : result.status === 'Pending' ? 'Kutilmoqda' : 'Yechilgan'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
