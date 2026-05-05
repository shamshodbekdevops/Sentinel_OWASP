import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { SecurityGauge } from '../components/SecurityGauge';
import { VulnerabilityPieChart } from '../components/VulnerabilityPieChart';
import { ComplianceBarChart } from '../components/ComplianceBarChart';
import { Shield, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, type DashboardData, type ScanSummary } from '../lib/api';

type PieDataPoint = {
  name: 'Critical' | 'High' | 'Medium' | 'Low';
  value: number;
  color: string;
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardData>({
    total_scans: 0,
    average_score: 0,
    total_findings: 0,
    completed_scans: 0,
    failed_scans: 0,
  });
  const [scans, setScans] = useState<ScanSummary[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboard, history] = await Promise.all([
          api.dashboardData(),
          api.scanHistory(),
        ]);
        setStats(dashboard);
        setScans(history.results || []);
      } catch {
        undefined;
      }
    };

    fetchData();
  }, []);

  const vulnerabilityData = useMemo<PieDataPoint[]>(() => {
    const totals = scans.reduce(
      (accumulator, scan) => {
        accumulator.Critical += Number(scan.risk_data?.Critical || 0);
        accumulator.High += Number(scan.risk_data?.High || 0);
        accumulator.Medium += Number(scan.risk_data?.Medium || 0);
        accumulator.Low += Number(scan.risk_data?.Low || 0);
        return accumulator;
      },
      { Critical: 0, High: 0, Medium: 0, Low: 0 },
    );

    const total = totals.Critical + totals.High + totals.Medium + totals.Low;
    if (total === 0) {
      return [
        { name: 'Critical', value: 3, color: '#ef4444' },
        { name: 'High', value: 7, color: '#f97316' },
        { name: 'Medium', value: 15, color: '#eab308' },
        { name: 'Low', value: 25, color: '#22c55e' },
      ];
    }

    return [
      { name: 'Critical', value: totals.Critical, color: '#ef4444' },
      { name: 'High', value: totals.High, color: '#f97316' },
      { name: 'Medium', value: totals.Medium, color: '#eab308' },
      { name: 'Low', value: totals.Low, color: '#22c55e' },
    ];
  }, [scans]);

  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const counts = new Map<string, number>(months.map((month) => [month, 0]));

    scans.forEach((scan) => {
      const month = new Date(scan.created_at).toLocaleString('en-US', { month: 'short' });
      const findings = scan.findings?.length || 0;
      counts.set(month, (counts.get(month) || 0) + findings);
    });

    return months.map((month) => ({
      month,
      vulnerabilities: counts.get(month) || 0,
    }));
  }, [scans]);

  const complianceData = useMemo(() => {
    const averageScore = Math.round(stats.average_score);
    const highCount = scans.reduce((sum, scan) => sum + Number(scan.risk_data?.High || 0), 0);
    const mediumCount = scans.reduce((sum, scan) => sum + Number(scan.risk_data?.Medium || 0), 0);
    const lowCount = scans.reduce((sum, scan) => sum + Number(scan.risk_data?.Low || 0), 0);

    return [
      { name: 'Injection', compliance: Math.max(40, averageScore - highCount * 6), color: '#22c55e' },
      { name: 'Auth', compliance: Math.max(45, averageScore - mediumCount * 4), color: '#22c55e' },
      { name: 'Exposure', compliance: Math.max(35, averageScore - highCount * 5), color: '#eab308' },
      { name: 'XXE', compliance: Math.max(60, averageScore + 5), color: '#22c55e' },
      { name: 'Access', compliance: Math.max(50, averageScore - mediumCount * 3), color: '#22c55e' },
      { name: 'Config', compliance: Math.max(30, averageScore - lowCount * 2 - mediumCount * 3), color: '#f97316' },
      { name: 'XSS', compliance: Math.max(40, averageScore - highCount * 5), color: '#22c55e' },
      { name: 'Deserialization', compliance: Math.max(35, averageScore - mediumCount * 4), color: '#eab308' },
      { name: 'Components', compliance: Math.max(25, averageScore - highCount * 7), color: '#ef4444' },
      { name: 'Logging', compliance: Math.max(55, averageScore + lowCount * 2), color: '#22c55e' },
    ];
  }, [scans, stats.average_score]);

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Xavfsizlik balli"
          value={Math.round(stats.average_score)}
          suffix="/100"
          icon={Shield}
          color="green"
          delay={0}
        />
        <StatCard
          title="Jami scanlar"
          value={stats.total_scans}
          icon={Activity}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Faol tahdidlar"
          value={Math.max(0, stats.total_scans - stats.completed_scans)}
          icon={AlertTriangle}
          color="red"
          delay={0.2}
        />
        <StatCard
          title="Yechilgan muammolar"
          value={stats.completed_scans}
          icon={CheckCircle2}
          color="yellow"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityGauge score={Math.round(stats.average_score)} />
        <VulnerabilityPieChart data={vulnerabilityData} />
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
        <h3 className="text-white mb-4">Zaifliklar dinamikasi</h3>

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

      <ComplianceBarChart data={complianceData} />
    </div>
  );
}
