import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Terminal, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { api } from '../lib/api';

interface LogEntry {
  id: number;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const scanLogs = [
  { type: 'info' as const, message: '[INFO] Initializing security scan...' },
  { type: 'info' as const, message: '[INFO] Resolving target domain...' },
  { type: 'success' as const, message: '[SUCCESS] Target resolved: 192.168.1.100' },
  { type: 'info' as const, message: '[SCAN] Testing SQL Injection vulnerabilities...' },
  { type: 'warning' as const, message: '[WARNING] Potential SQL injection found in /api/users' },
  { type: 'info' as const, message: '[SCAN] Testing XSS vulnerabilities...' },
  { type: 'error' as const, message: '[CRITICAL] XSS vulnerability detected in /search' },
  { type: 'info' as const, message: '[SCAN] Checking CSRF protection...' },
  { type: 'warning' as const, message: '[WARNING] Missing CSRF token in /login' },
  { type: 'info' as const, message: '[SCAN] Analyzing security headers...' },
  { type: 'success' as const, message: '[SUCCESS] Content-Security-Policy header present' },
  { type: 'warning' as const, message: '[WARNING] X-Frame-Options header missing' },
  { type: 'info' as const, message: '[SCAN] Testing authentication mechanisms...' },
  { type: 'info' as const, message: '[SCAN] Checking for outdated dependencies...' },
  { type: 'error' as const, message: '[CRITICAL] Vulnerable package detected: express@3.x' },
  { type: 'info' as const, message: '[SCAN] Analyzing API endpoints...' },
  { type: 'success' as const, message: '[SUCCESS] All endpoints use HTTPS' },
  { type: 'info' as const, message: '[SCAN] Generating security report...' },
  { type: 'success' as const, message: '[COMPLETE] Scan finished. Found 3 critical, 4 high, 6 medium issues.' },
];

export function NewScanPage() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState('');
  const [scanId, setScanId] = useState<number | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!scanId || !scanning) {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      try {
        const status = await api.scanStatus(scanId);
        if (cancelled) {
          return;
        }

        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        setLogs((prev) => {
          const nextLogs = [
            ...prev,
            {
              id: Date.now(),
              timestamp,
              type: status.status === 'Failed' ? 'error' : status.status === 'Completed' ? 'success' : 'info',
              message: `Scan ${status.status.toLowerCase()} for ${status.url}`,
            },
          ];
          return nextLogs.slice(-15);
        });

        setProgress(status.status === 'Completed' ? 100 : status.status === 'Failed' ? 100 : 65);

        if (status.status === 'Completed' || status.status === 'Failed') {
          setScanning(false);
          setScanId(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch scan status.');
          setScanning(false);
          setScanId(null);
        }
      }
    };

    tick();
    const interval = window.setInterval(tick, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [scanId, scanning]);

  const handleScan = async () => {
    setScanning(true);
    setProgress(10);
    setLogs([]);
    setError('');

    try {
      const result = await api.startScan(url);
      setScanId(result.id);
      setLogs([
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: `Scan started for ${url}`,
        },
      ]);
    } catch (err) {
      setScanning(false);
      setScanId(null);
      setError(err instanceof Error ? err.message : 'Failed to start scan.');
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#eab308]" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-[#ef4444]" />;
      default:
        return <Terminal className="w-4 h-4 text-[#3b82f6]" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#22c55e';
      case 'warning':
        return '#eab308';
      case 'error':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-white text-2xl mb-2">New Security Scan</h2>
        <p className="text-gray-400">Perform comprehensive security analysis on your target</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-xl backdrop-blur-xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={scanning}
              className="w-full px-6 py-4 rounded-lg bg-[#0f172a] border-2 border-transparent text-white placeholder-gray-500 transition-all duration-300 focus:outline-none disabled:opacity-50"
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
              onFocus={(e) => {
                if (!scanning) {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 24px rgba(59, 130, 246, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent';
                e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
              }}
            />
          </div>

          <motion.button
            onClick={handleScan}
            disabled={scanning || !url}
            className="px-8 py-4 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
            }}
            whileHover={!scanning && url ? {
              scale: 1.05,
              boxShadow: '0 12px 32px rgba(59, 130, 246, 0.6)',
            } : {}}
            whileTap={!scanning && url ? { scale: 0.98 } : {}}
          >
            {scanning ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Start Scan
              </span>
            )}

            {scanning && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </motion.button>
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {scanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="relative w-full h-3 bg-[#0f172a] rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #22c55e 0%, #3b82f6 50%, #22c55e 100%)',
                  backgroundSize: '200% 100%',
                  width: `${progress}%`,
                  boxShadow: '0 0 16px rgba(34, 197, 94, 0.6)',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '200% 0%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>
            <p className="text-[#3b82f6] text-sm text-center">
              {Math.round(progress)}% Complete
            </p>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-xl overflow-hidden border border-white/10"
        style={{
          background: 'rgba(2, 6, 23, 0.95)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="bg-[#0f172a] px-6 py-3 border-b border-white/10 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#22c55e]" style={{ filter: 'drop-shadow(0 0 4px #22c55e)' }} />
          <span className="text-white font-mono">Scan Console</span>
          {logs.length > 0 && (
            <span className="ml-auto text-gray-400 text-sm font-mono">{logs.length} entries</span>
          )}
        </div>

        <div
          className="p-6 font-mono text-sm overflow-y-auto"
          style={{
            height: '400px',
            background: '#000000',
          }}
        >
          <AnimatePresence>
            {logs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-center py-20"
              >
                Waiting for scan to start...
              </motion.div>
            )}

            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 mb-2 hover:bg-white/5 px-2 py-1 rounded transition-colors"
              >
                <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                <div className="shrink-0 mt-0.5">{getLogIcon(log.type)}</div>
                <span
                  style={{
                    color: getLogColor(log.type),
                    textShadow: `0 0 10px ${getLogColor(log.type)}40`,
                  }}
                >
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>
      </motion.div>
    </div>
  );
}
