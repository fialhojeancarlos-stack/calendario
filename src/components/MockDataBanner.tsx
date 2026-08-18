import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MockDataBannerProps {
  onOpenSettings: () => void;
}

export const MockDataBanner: React.FC<MockDataBannerProps> = ({ onOpenSettings }) => {
  return (
    <div
      id="demo-mode-banner"
      className="flex flex-wrap items-center justify-between gap-3 bg-[#161b22] border-b border-[#30363d] px-6 py-2 text-xs text-amber-300"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
        <span>
          <strong>Modo de Demonstração Ativo:</strong> Exibindo chamados para a instância{' '}
          <code className="font-mono bg-[#0d1117] border border-[#30363d] px-1.5 py-0.5 rounded font-bold text-amber-200">
            aztecnologia.atlassian.net
          </code>
        </span>
      </div>

      <button
        id="connect-live-jira-btn"
        onClick={onOpenSettings}
        className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:underline cursor-pointer"
      >
        <span>Ver Status do .env</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
