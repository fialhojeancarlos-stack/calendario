import { JiraIssue, JiraProject } from '../types';

export const REQUIRED_PROJECTS: { key: string; name: string }[] = [
  { key: 'eFornecedor', name: 'eFornecedor' },
  { key: 'Compras Preparação', name: 'Compras Preparação' },
  { key: 'Patrimônio Imobiliário', name: 'Patrimônio Imobiliário' },
  { key: 'SIGA - Ata Registro de Preços', name: 'SIGA - Ata Registro de Preços' },
  { key: 'Almoxarifado', name: 'Almoxarifado' },
  { key: 'Novo Contratos', name: 'Novo Contratos' },
  { key: 'Flowbee', name: 'Flowbee' },
  { key: 'Catálogo de Materiais e Serviços', name: 'Catálogo de Materiais e Serviços' },
  { key: 'Patrimônio Mobiliário', name: 'Patrimônio Mobiliário' },
  { key: 'Compra Direta', name: 'Compra Direta' },
  { key: 'SIGA - Execução de Licitações', name: 'SIGA - Execução de Licitações' },
  { key: 'Plano de Compras', name: 'Plano de Compras' },
  { key: 'Credenciamento', name: 'Credenciamento' },
  { key: 'Arquitetura', name: 'Arquitetura' },
  { key: 'Gerador de Relatório', name: 'Gerador de Relatório' },
  { key: 'Patrimônio Intangível', name: 'Patrimônio Intangível' },
  { key: 'Setup', name: 'Setup' },
  { key: 'SIGABI', name: 'SIGABI' },
  { key: 'Contratos', name: 'Contratos' },
  { key: 'FlyEditor', name: 'FlyEditor' },
  { key: 'Intenção de registro de preços', name: 'Intenção de registro de preços' },
  { key: 'UX/UI Design', name: 'UX/UI Design' },
  { key: 'Solicitação de Compras', name: 'Solicitação de Compras' },
];

export function normalizeProjectName(rawName?: string, rawKey?: string): string {
  const nameStr = (rawName || '').trim();
  const keyStr = (rawKey || '').trim();
  const str = `${nameStr} ${keyStr}`.toLowerCase();

  if (str.includes('efornecedor')) return 'eFornecedor';
  if (str.includes('compras preparação') || str.includes('compras preparacao')) return 'Compras Preparação';
  if (str.includes('patrimônio imobiliário') || str.includes('patrimonio imobiliario')) return 'Patrimônio Imobiliário';
  if (str.includes('ata registro de preços') || str.includes('ata registro de precos')) return 'SIGA - Ata Registro de Preços';
  if (str.includes('almoxarifado')) return 'Almoxarifado';
  if (str.includes('novo contratos')) return 'Novo Contratos';
  if (str.includes('flowbee')) return 'Flowbee';
  if (str.includes('catálogo de materiais') || str.includes('catalogo de materiais') || str.includes('cdmes')) return 'Catálogo de Materiais e Serviços';
  if (str.includes('patrimônio mobiliário') || str.includes('patrimonio mobiliario') || str.includes('pat30')) return 'Patrimônio Mobiliário';
  if (str.includes('compra direta')) return 'Compra Direta';
  if (str.includes('execução de licitações') || str.includes('execucao de licitacoes')) return 'SIGA - Execução de Licitações';
  if (str.includes('plano de compras')) return 'Plano de Compras';
  if (str.includes('credenciamento')) return 'Credenciamento';
  if (str.includes('arquitetura')) return 'Arquitetura';
  if (str.includes('gerador de relatório') || str.includes('gerador de relatorio')) return 'Gerador de Relatório';
  if (str.includes('patrimônio intangível') || str.includes('patrimonio intangivel')) return 'Patrimônio Intangível';
  if (str.includes('setup')) return 'Setup';
  if (str.includes('sigabi')) return 'SIGABI';
  if (str.includes('contratos')) return 'Contratos';
  if (str.includes('flyeditor')) return 'FlyEditor';
  if (str.includes('intenção de registro') || str.includes('intencao de registro')) return 'Intenção de registro de preços';
  if (str.includes('ux/ui')) return 'UX/UI Design';
  if (str.includes('solicitação de compras') || str.includes('solicitacao de compras')) return 'Solicitação de Compras';

  return nameStr || keyStr || 'Outro';
}

export const MOCK_PROJECTS: JiraProject[] = REQUIRED_PROJECTS.map((p) => ({
  key: p.key,
  name: p.name,
  active: true,
}));

export const MOCK_CLIENTS = [
  'Prefeitura de Campo Grande',
  'Governo do Estado de MS',
  'Secretaria de Saúde',
  'Tribunal de Justiça MS',
  'Câmara Municipal',
  'Autarquia de Trânsito',
];

export const MOCK_SPRINTS = [
  'Sprint 24 - Agosto 2026',
  'Sprint 25 - Agosto 2026',
  'Sprint 26 - Setembro 2026',
  'Sprint Backlog de Entregas',
];

// Generates dynamic mock issues around current date
export function generateMockIssues(currentDate: Date = new Date()): JiraIssue[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Format date string helper YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const issues: JiraIssue[] = [
    {
      issue_key: 'PAT30-1042',
      issue_id: '10001',
      summary: 'Implementar inventário físico por leitor de código de barras QR Code',
      issue_type: 'Épico',
      status: 'Em andamento',
      status_category: 'In Progress',
      assignee_name: 'Carlos Eduardo Silva',
      assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      project_key: 'PAT30',
      project_name: 'Patrimônio Mobiliário',
      client: 'Prefeitura de Campo Grande',
      sprint_id: '24',
      sprint_name: 'Sprint 24 - Agosto 2026',
      due_date: formatDateStr(year, month, 5),
      url: 'https://aztecnologia.atlassian.net/browse/PAT30-1042',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'PAT30-1048',
      issue_id: '10002',
      summary: 'Ajuste de cálculo de depreciação acumulada para bens do grupo 4',
      issue_type: 'Solicitação de melhoria',
      status: 'Concluído',
      status_category: 'Done',
      assignee_name: 'Mariana Costa',
      assignee_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      project_key: 'PAT30',
      project_name: 'Patrimônio Mobiliário',
      client: 'Prefeitura de Campo Grande',
      sprint_id: '24',
      sprint_name: 'Sprint 24 - Agosto 2026',
      due_date: formatDateStr(year, month, 5),
      url: 'https://aztecnologia.atlassian.net/browse/PAT30-1048',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'SIS20-802',
      issue_id: '10003',
      summary: 'Integração de rastreamento via telemetria GPS em tempo real',
      issue_type: 'Épico',
      status: 'Em andamento',
      status_category: 'In Progress',
      assignee_name: 'Lucas Ferreira',
      assignee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      project_key: 'SIS20',
      project_name: 'Sistema de Gestão de Frotas',
      client: 'Autarquia de Trânsito',
      sprint_id: '24',
      sprint_name: 'Sprint 24 - Agosto 2026',
      due_date: formatDateStr(year, month, 8),
      url: 'https://aztecnologia.atlassian.net/browse/SIS20-802',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'AGR10-312',
      issue_id: '10004',
      summary: 'Módulo de lançamento de insumos agrícolas e receitas defensivas',
      issue_type: 'Solicitação de melhoria',
      status: 'A Fazer',
      status_category: 'To Do',
      assignee_name: 'Fernanda Lima',
      assignee_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
      project_key: 'AGR10',
      project_name: 'Módulo Agrícola & Pecuária',
      client: 'Governo do Estado de MS',
      sprint_id: '25',
      sprint_name: 'Sprint 25 - Agosto 2026',
      due_date: formatDateStr(year, month, 12),
      url: 'https://aztecnologia.atlassian.net/browse/AGR10-312',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'FIN40-921',
      issue_id: '10005',
      summary: 'Relatório consolidado de empenhos e liquidação orçamentária PPA',
      issue_type: 'Solicitação de melhoria',
      status: 'Concluído',
      status_category: 'Done',
      assignee_name: 'Roberto Souza',
      assignee_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      project_key: 'FIN40',
      project_name: 'Gestão Financeira & Orçamentária',
      client: 'Secretaria de Saúde',
      sprint_id: '24',
      sprint_name: 'Sprint 24 - Agosto 2026',
      due_date: formatDateStr(year, month, 13),
      url: 'https://aztecnologia.atlassian.net/browse/FIN40-921',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'PAT30-1120',
      issue_id: '10006',
      summary: 'Exportação em massa do relatório de baixas de bens patrimoniais em PDF/Excel',
      issue_type: 'Épico',
      status: 'Em andamento',
      status_category: 'In Progress',
      assignee_name: 'Carlos Eduardo Silva',
      assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      project_key: 'PAT30',
      project_name: 'Patrimônio Mobiliário',
      client: 'Prefeitura de Campo Grande',
      sprint_id: '25',
      sprint_name: 'Sprint 25 - Agosto 2026',
      due_date: formatDateStr(year, month, 13),
      url: 'https://aztecnologia.atlassian.net/browse/PAT30-1120',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'SIS20-845',
      issue_id: '10007',
      summary: 'Alerta de agendamento de manutenção preventiva e troca de óleo por KM',
      issue_type: 'Solicitação de melhoria',
      status: 'A Fazer',
      status_category: 'To Do',
      assignee_name: 'Lucas Ferreira',
      assignee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      project_key: 'SIS20',
      project_name: 'Sistema de Gestão de Frotas',
      client: 'Autarquia de Trânsito',
      sprint_id: '25',
      sprint_name: 'Sprint 25 - Agosto 2026',
      due_date: formatDateStr(year, month, 13),
      url: 'https://aztecnologia.atlassian.net/browse/SIS20-845',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'NCON-3338',
      issue_id: '10038',
      summary: 'Aditivo de prazo e repactuação de saldo contratual no módulo de Contratos',
      issue_type: 'Solicitação de melhoria',
      status: 'Em andamento',
      status_category: 'In Progress',
      assignee_name: 'Mariana Costa',
      assignee_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      project_key: 'NCON',
      project_name: 'Novo Contratos',
      client: 'Governo do Estado de MS',
      sprint_id: '25',
      sprint_name: 'Sprint 25 - Agosto 2026',
      due_date: formatDateStr(year, month, 14),
      url: 'https://aztecnologia.atlassian.net/browse/NCON-3338',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'RH50-204',
      issue_id: '10008',
      summary: 'Ajuste no cálculo de horas extras e adicional noturno com escala 12x36',
      issue_type: 'Solicitação de melhoria',
      status: 'Em andamento',
      status_category: 'In Progress',
      assignee_name: 'Aline Rocha',
      assignee_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      project_key: 'RH50',
      project_name: 'Recursos Humanos & Ponto',
      client: 'Câmara Municipal',
      sprint_id: '25',
      sprint_name: 'Sprint 25 - Agosto 2026',
      due_date: formatDateStr(year, month, 13),
      url: 'https://aztecnologia.atlassian.net/browse/RH50-204',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'RH50-210',
      issue_id: '10009',
      summary: 'Homologação do arquivo eSocial evento S-1200 para órgãos públicos',
      issue_type: 'Épico',
      status: 'A Fazer',
      status_category: 'To Do',
      assignee_name: 'Aline Rocha',
      assignee_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      project_key: 'RH50',
      project_name: 'Recursos Humanos & Ponto',
      client: 'Câmara Municipal',
      sprint_id: '25',
      sprint_name: 'Sprint 25 - Agosto 2026',
      due_date: formatDateStr(year, month, 13),
      url: 'https://aztecnologia.atlassian.net/browse/RH50-210',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'FIN40-955',
      issue_id: '10010',
      summary: 'Assinatura digital de empenho orçamentário com certificado ICP-Brasil',
      issue_type: 'Épico',
      status: 'Em andamento',
      status_category: 'In Progress',
      assignee_name: 'Roberto Souza',
      assignee_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      project_key: 'FIN40',
      project_name: 'Gestão Financeira & Orçamentária',
      client: 'Tribunal de Justiça MS',
      sprint_id: '25',
      sprint_name: 'Sprint 25 - Agosto 2026',
      due_date: formatDateStr(year, month, 18),
      url: 'https://aztecnologia.atlassian.net/browse/FIN40-955',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'PAT30-1155',
      issue_id: '10011',
      summary: 'Transferência de carga patrimonial entre secretarias com aceite digital',
      issue_type: 'Épico',
      status: 'A Fazer',
      status_category: 'To Do',
      assignee_name: 'Mariana Costa',
      assignee_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      project_key: 'PAT30',
      project_name: 'Patrimônio Mobiliário',
      client: 'Prefeitura de Campo Grande',
      sprint_id: '25',
      sprint_name: 'Sprint 25 - Agosto 2026',
      due_date: formatDateStr(year, month, 22),
      url: 'https://aztecnologia.atlassian.net/browse/PAT30-1155',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'SIS20-890',
      issue_id: '10012',
      summary: 'Validação de cartão de abastecimento com limite de cota mensal por veículo',
      issue_type: 'Solicitação de melhoria',
      status: 'Concluído',
      status_category: 'Done',
      assignee_name: 'Lucas Ferreira',
      assignee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      project_key: 'SIS20',
      project_name: 'Sistema de Gestão de Frotas',
      client: 'Autarquia de Trânsito',
      sprint_id: '25',
      sprint_name: 'Sprint 25 - Agosto 2026',
      due_date: formatDateStr(year, month, 25),
      url: 'https://aztecnologia.atlassian.net/browse/SIS20-890',
      synced_at: new Date().toISOString(),
    },
    {
      issue_key: 'AGR10-340',
      issue_id: '10013',
      summary: 'Georeferenciamento de parcelas e mapeamento de pivôs de irrigação',
      issue_type: 'Épico',
      status: 'A Fazer',
      status_category: 'To Do',
      assignee_name: 'Fernanda Lima',
      assignee_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
      project_key: 'AGR10',
      project_name: 'Módulo Agrícola & Pecuária',
      client: 'Governo do Estado de MS',
      sprint_id: '26',
      sprint_name: 'Sprint 26 - Setembro 2026',
      due_date: formatDateStr(year, month, 28),
      url: 'https://aztecnologia.atlassian.net/browse/AGR10-340',
      synced_at: new Date().toISOString(),
    },
  ];

  return issues;
}
