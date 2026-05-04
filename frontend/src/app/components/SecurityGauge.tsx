import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface SecurityGaugeProps {
  score: number;
}

export function SecurityGauge({ score }: SecurityGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = score / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const data = [{ value: animatedScore, fill: getColorForScore(animatedScore) }];

  function getColorForScore(s: number) {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#eab308';
    return '#ef4444';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-xl backdrop-blur-xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <h3 className="text-white mb-4">Security Score</h3>

      <div className="relative flex items-center justify-center">
        <RadialBarChart
          width={300}
          height={300}
          cx={150}
          cy={150}
          innerRadius={80}
          outerRadius={140}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            dataKey="value"
            cornerRadius={10}
            animationDuration={2000}
          />
        </RadialBarChart>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-6xl font-bold"
            style={{
              color: getColorForScore(animatedScore),
              textShadow: `0 0 30px ${getColorForScore(animatedScore)}80`,
            }}
          >
            {animatedScore}
          </span>
          <span className="text-gray-400 text-sm mt-2">/ 100</span>
          <span className="text-gray-500 text-xs mt-1">Overall Rating</span>
        </div>
      </div>
    </motion.div>
  );
}
