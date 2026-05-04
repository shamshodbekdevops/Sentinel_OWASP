import { Outlet } from 'react-router';
import { motion } from 'motion/react';

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #020617 0%, #0f172a 100%)
          `,
        }}
      />

      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-xl"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() + 0.5, 1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
