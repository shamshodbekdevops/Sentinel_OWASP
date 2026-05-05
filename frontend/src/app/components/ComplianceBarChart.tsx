import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type ComplianceItem = {
  name: string;
  compliance: number;
  color: string;
};

interface ComplianceBarChartProps {
  data?: ComplianceItem[];
}

const defaultData: ComplianceItem[] = [
  { name: 'Injection', compliance: 85, color: '#22c55e' },
  { name: 'Auth', compliance: 92, color: '#22c55e' },
  { name: 'Exposure', compliance: 78, color: '#eab308' },
  { name: 'XXE', compliance: 95, color: '#22c55e' },
  { name: 'Access', compliance: 88, color: '#22c55e' },
  { name: 'Config', compliance: 65, color: '#f97316' },
  { name: 'XSS', compliance: 90, color: '#22c55e' },
  { name: 'Deserialization', compliance: 72, color: '#eab308' },
  { name: 'Components', compliance: 58, color: '#ef4444' },
  { name: 'Logging', compliance: 80, color: '#22c55e' },
];

export function ComplianceBarChart({ data = defaultData }: ComplianceBarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="rounded-xl backdrop-blur-xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <h3 className="text-white mb-4">OWASP Top 10 Compliance</h3>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
          <YAxis dataKey="name" type="category" width={120} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              background: 'rgba(2, 6, 23, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Bar dataKey="compliance" radius={[0, 8, 8, 0]} animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
