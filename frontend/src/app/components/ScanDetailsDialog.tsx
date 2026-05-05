import { motion } from 'motion/react';
import { Calendar, Download, FileText, ShieldAlert, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { type ScanSummary, api } from '../lib/api';

interface ScanDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scan: ScanSummary | null;
  onDownloadPdf?: (scanId: number) => Promise<void> | void;
}

const severityConfig = {
  Critical: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  High: { text: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
  Medium: { text: '#eab308', bg: 'rgba(234, 179, 8, 0.12)' },
  Low: { text: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
};

function getSeverityRank(scan: ScanSummary): 'Critical' | 'High' | 'Medium' | 'Low' {
  const riskData = scan.risk_data || {};
  if ((riskData.Critical || 0) > 0) return 'Critical';
  if ((riskData.High || 0) > 0) return 'High';
  if ((riskData.Medium || 0) > 0) return 'Medium';
  return 'Low';
}

function getField(value: unknown): string {
  return typeof value === 'string' ? value : 'N/A';
}

export function ScanDetailsDialog({ open, onOpenChange, scan, onDownloadPdf }: ScanDetailsDialogProps) {
  const severity = scan ? getSeverityRank(scan) : 'Low';
  const riskData = scan?.risk_data || {};
  const findings = scan?.findings || [];
  const date = scan ? new Date(scan.created_at) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl max-h-[88vh] overflow-y-auto border-white/10 bg-[#020617] text-white sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-[#3b82f6]" />
            Scan tafsilotlari
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            To‘liq scan xulosasi, zaifliklar va risk taqsimoti.
          </DialogDescription>
        </DialogHeader>

        {!scan ? (
          <div className="py-10 text-center text-gray-400">Hech qanday scan tanlanmadi.</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Target className="h-4 w-4" />
                  Nishon URL
                </div>
                <div className="break-all text-white font-mono text-sm">{scan.url}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Calendar className="h-4 w-4" />
                  Scan vaqti
                </div>
                <div className="text-white text-sm">
                  {date?.toLocaleDateString()} {date?.toLocaleTimeString()}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <ShieldAlert className="h-4 w-4" />
                  Risk darajasi
                </div>
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    color: severityConfig[severity].text,
                    background: severityConfig[severity].bg,
                    border: `1px solid ${severityConfig[severity].text}40`,
                  }}
                >
                  {severity}
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <FileText className="h-4 w-4" />
                  Ball
                </div>
                <div className="text-2xl font-semibold text-white">{scan.score}/100</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-300">Risk taqsimoti</h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-red-500/10 p-3 text-center">
                  <div className="text-xl font-semibold text-red-400">{riskData.Critical || 0}</div>
                  <div className="text-xs text-gray-400">Critical</div>
                </div>
                <div className="rounded-lg bg-orange-500/10 p-3 text-center">
                  <div className="text-xl font-semibold text-orange-400">{riskData.High || 0}</div>
                  <div className="text-xs text-gray-400">High</div>
                </div>
                <div className="rounded-lg bg-yellow-500/10 p-3 text-center">
                  <div className="text-xl font-semibold text-yellow-400">{riskData.Medium || 0}</div>
                  <div className="text-xs text-gray-400">Medium</div>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3 text-center">
                  <div className="text-xl font-semibold text-green-400">{riskData.Low || 0}</div>
                  <div className="text-xs text-gray-400">Low</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#020617]">
              <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
                Topilmalar ({findings.length})
              </div>
              <div className="max-h-[320px] space-y-3 overflow-y-auto p-4">
                {findings.length === 0 ? (
                  <div className="text-sm text-gray-400">Bu scan uchun hech qanday finding qayd etilmagan.</div>
                ) : (
                  findings.map((finding, index) => {
                    const title = getField(finding.title);
                    const severityLabel = getField(finding.severity);
                    const detail = getField(finding.detail);
                    const target = getField(finding.target);
                    const severityKey = severityLabel in severityConfig ? severityLabel as keyof typeof severityConfig : 'Low';

                    return (
                      <motion.div
                        key={`${title}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-white/10 bg-white/5 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="font-medium text-white">{title}</div>
                          <span
                            className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold"
                            style={{
                              color: severityConfig[severityKey].text,
                              background: severityConfig[severityKey].bg,
                            }}
                          >
                            {severityLabel}
                          </span>
                        </div>
                        <div className="mb-1 text-xs text-gray-400">Target: {target}</div>
                        <div className="text-sm leading-6 text-gray-300">{detail}</div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => onDownloadPdf?.(scan.id)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white"
              >
                <Download className="h-4 w-4" />
                PDF yuklab olish
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
