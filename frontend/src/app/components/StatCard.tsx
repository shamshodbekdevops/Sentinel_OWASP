import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  color: 'green' | 'yellow' | 'red' | 'blue';
  delay?: number;
}

const colorMap = {
  green: {
    glow: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.3)',
    text: '#22c55e',
  },
  yellow: {
    glow: '#eab308',
    bg: 'rgba(234, 179, 8, 0.1)',
    border: 'rgba(234, 179, 8, 0.3)',
    text: '#eab308',
  },
  red: {
    glow: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    text: '#ef4444',
  },
  blue: {
    glow: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    text: '#3b82f6',
  },
};

export function StatCard({ title, value, suffix = '', icon: Icon, color, delay = 0 }: StatCardProps) {
  const [count, setCount] = useState(0);
  const colors = colorMap[color];

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-xl p-6 backdrop-blur-xl"
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(15, 23, 42, 0.6) 100%)`,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4)`,
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 12px 40px ${colors.glow}40`,
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
        <Icon className="w-full h-full" style={{ color: colors.text }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="p-2 rounded-lg"
            style={{
              background: colors.bg,
              boxShadow: `0 0 16px ${colors.glow}60`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: colors.text }} />
          </div>
          <p className="text-gray-400 text-sm">{title}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl font-bold"
            style={{ color: colors.text, textShadow: `0 0 20px ${colors.glow}60` }}
          >
            {count}
          </span>
          {suffix && <span className="text-gray-500">{suffix}</span>}
        </div>
      </div>
    </motion.div>
  );
}
