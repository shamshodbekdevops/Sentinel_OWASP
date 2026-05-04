import { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { SecurityGauge } from '../components/SecurityGauge';
import { VulnerabilityPieChart } from '../components/VulnerabilityPieChart';
import { ComplianceBarChart } from '../components/ComplianceBarChart';
import { Shield, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, type DashboardData } from '../lib/api';

const trendData = [
  { month: 'Jan', vulnerabilities: 45 },
  { month: 'Feb', vulnerabilities: 38 },
  { month: 'Mar', vulnerabilities: 42 },
  { month: 'Apr', vulnerabilities: 35 },
  { month: 'May', vulnerabilities: 28 },
  { month: 'Jun', vulnerabilities: 22 },
];

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardData>({
    total_scans: 0,
    average_score: 0,
    total_findings: 0,
    completed_scans: 0,
    failed_scans: 0,
  });

  useEffect(() => {
    api.dashboardData().then(setStats).catch(() => undefined);
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Security Score"
          value={Math.round(stats.average_score)}
          suffix="/100"
          icon={Shield}
          color="green"
          delay={0}
        />
        <StatCard
          title="Total Scans"
          value={stats.total_scans}
          icon={Activity}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Active Threats"
          value={Math.max(0, stats.total_scans - stats.completed_scans)}
          icon={AlertTriangle}
          color="red"
          delay={0.2}
        />
        <StatCard
          title="Resolved Issues"
          value={stats.completed_scans}
          icon={CheckCircle2}
          color="yellow"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityGauge score={Math.round(stats.average_score)} />
        <VulnerabilityPieChart />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="rounded-xl backdrop-blur-xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <h3 className="text-white mb-4">Vulnerability Trends</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                background: 'rgba(2, 6, 23, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="vulnerabilities"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
              activeDot={{
                r: 8,
                style: { filter: 'drop-shadow(0 0 8px #22c55e)' }
              }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <ComplianceBarChart />
    </div>
  );
}
