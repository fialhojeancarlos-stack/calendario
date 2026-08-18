import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, RefreshCw, X } from 'lucide-react';

interface SyncStatusProps {
  statusMsg: { type: 'info' | 'warning' | 'error' | 'success'; text: string } | null;
  onClose: () => void;
  onRetry?: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ statusMsg, onClose, onRetry }) => {
  if (!statusMsg) return null;

  const styleMap = {
    info: {
      bg: 'bg-[#161b22] border-[#30363d] text-slate-200',
      icon: <Info className="h-4 w-4 text-blue-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-950/60 border-amber-800 text-amber-200',
      icon: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-950/60 border-rose-800 text-rose-200',
      icon: <XCircle className="h-4 w-4 text-rose-400 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-950/60 border-emerald-800 text-emerald-200',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    },
  };

  const currentStyle = styleMap[statusMsg.type];

  return (
    <div
      id="sync-status-banner"
      className={`flex items-center justify-between gap-3 border px-4 py-2 text-xs font-medium transition-all ${currentStyle.bg}`}
    >
      <div className="flex items-center gap-2">
        {currentStyle.icon}
        <span>{statusMsg.text}</span>
      </div>

      <div className="flex items-center gap-2">
        {statusMsg.type === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 font-bold underline hover:no-underline"
          >
            <RefreshCw className="h-3 w-3" />
            Tentar novamente
          </button>
        )}

        <button onClick={onClose} className="p-1 hover:opacity-80">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
