import { Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';

export function ScanInterface() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanId, setScanId] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState('');

  const tests = [
    'Checking SQL Injection...',
    'Testing XSS Vulnerabilities...',
    'Analyzing CSRF Protection...',
    'Scanning for Security Headers...',
    'Validating Authentication...',
  ];

  // Poll for scan status
  useEffect(() => {
    if (!scanId || status === 'completed' || status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const result = await api.scanStatus(scanId);
        
        if (result.status === 'Completed') {
          setStatus('completed');
          setScanning(false);
          setError('');
        } else if (result.status === 'Failed') {
          setStatus('failed');
          setScanning(false);
          setError('Scan failed. Please try again.');
        }
        // Running - continue polling
      } catch (err) {
        console.error('Error checking scan status:', err);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [scanId, status]);

  const handleScan = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setScanning(true);
      setStatus('running');
      setError('');
      
      const result = await api.startScan(url);
      setScanId(result.id);
    } catch (err: any) {
      setScanning(false);
      setStatus('failed');
      setError(err.message || 'Failed to start scan');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'failed':
        return '#ef4444';
      case 'running':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="rounded-xl backdrop-blur-xl p-8"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <h3 className="text-white mb-6 text-center">Start Security Scan</h3>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
            placeholder="Enter target URL (e.g., https://example.com)..."
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
          disabled={scanning || !url.trim()}
          className="px-8 py-4 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
          }}
          whileHover={!scanning && url.trim() ? {
            scale: 1.05,
            boxShadow: '0 12px 32px rgba(59, 130, 246, 0.6)',
          } : {}}
          whileTap={!scanning && url.trim() ? { scale: 0.98 } : {}}
        >
          {scanning ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Scanning...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Scan Now
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

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {scanning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div className="relative w-full h-2 bg-[#0f172a] rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #22c55e 0%, #3b82f6 50%, #22c55e 100%)',
                backgroundSize: '200% 100%',
                width: '100%',
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

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[#3b82f6] text-sm text-center"
            style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}
          >
            {status === 'running' ? 'Scanning in progress...' : 'Processing results...'}
          </motion.p>
        </motion.div>
      )}

      {status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-400 text-sm">Scan completed successfully! Check reports for details.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
