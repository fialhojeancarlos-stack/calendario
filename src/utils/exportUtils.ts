import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { JiraIssue } from '../types';
import { formatToDDMMAAAA } from './dateUtils';
import { format } from 'date-fns';

export function exportToExcel(issues: JiraIssue[], filename = 'relatorio_entregas_jira.xlsx') {
  if (!issues || issues.length === 0) {
    alert('Nenhum chamado disponível para exportação.');
    return;
  }

  // Map issues to clean excel rows
  const data = issues.map((issue) => {
    const isUnscheduled = !issue.due_date;
    return {
      'Tipo': issue.issue_type || '-',
      'Chave': issue.issue_key,
      'Resumo / Descrição': issue.summary,
      'Projeto': issue.project_name || issue.project_key,
      'Cliente': issue.client || '-',
      'Status': issue.status,
      'Data de Criação': issue.created_at_jira ? formatToDDMMAAAA(issue.created_at_jira) : '-',
      'Data Prevista': issue.due_date ? formatToDDMMAAAA(issue.due_date) : 'Sem Data Prevista',
      'Sprint': issue.sprint_name || '-',
      'Responsável': issue.assignee_name || 'Não atribuído',
      'Link Jira': issue.url || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 16 }, // Tipo
    { wch: 14 }, // Chave
    { wch: 45 }, // Resumo
    { wch: 22 }, // Projeto
    { wch: 18 }, // Cliente
    { wch: 18 }, // Status
    { wch: 16 }, // Data de Criação
    { wch: 16 }, // Data Prevista
    { wch: 22 }, // Sprint
    { wch: 22 }, // Responsável
    { wch: 40 }, // Link
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Chamados Jira');

  XLSX.writeFile(workbook, filename);
}

export function exportToPdf(
  issues: JiraIssue[],
  filename = 'relatorio_entregas_jira.pdf',
  reportTitle = 'Relatório de Chamados - Jira'
) {
  if (!issues || issues.length === 0) {
    alert('Nenhum chamado disponível para exportação.');
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(reportTitle, 14, 15);

  // Subheader
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  const dateFormatted = format(new Date(), 'dd/MM/yyyy HH:mm');
  doc.text(
    `Gerado em: ${dateFormatted} | Total de chamados: ${issues.length}`,
    14,
    21
  );

  const isUnscheduledView = issues.every((i) => !i.due_date);

  // Table rows and headers
  const headers = isUnscheduledView
    ? ['Tipo', 'Chave', 'Resumo', 'Projeto / Cliente', 'Status', 'Data de Criação', 'Responsável']
    : ['Data Prevista', 'Chave', 'Resumo', 'Projeto / Cliente', 'Status', 'Sprint', 'Responsável'];

  const tableData = issues.map((issue) =>
    isUnscheduledView
      ? [
          issue.issue_type || 'Épico',
          issue.issue_key,
          issue.summary,
          issue.project_name + (issue.client ? ` (${issue.client})` : ''),
          issue.status,
          issue.created_at_jira ? formatToDDMMAAAA(issue.created_at_jira) : '-',
          issue.assignee_name || 'Não atribuído',
        ]
      : [
          formatToDDMMAAAA(issue.due_date),
          issue.issue_key,
          issue.summary,
          issue.project_name + (issue.client ? ` (${issue.client})` : ''),
          issue.status,
          issue.sprint_name || '-',
          issue.assignee_name || 'Não atribuído',
        ]
  );

  autoTable(doc, {
    startY: 26,
    head: [headers],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Dark slate header
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 22, fontStyle: 'bold', textColor: [37, 99, 235] }, // Chave
      2: { cellWidth: 'auto' }, // Resumo
      3: { cellWidth: 40 }, // Projeto
      4: { cellWidth: 28 }, // Status
      5: { cellWidth: 28 }, // Data Criação / Sprint
      6: { cellWidth: 30 }, // Responsável
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Light zebra row
    },
    margin: { left: 14, right: 14, top: 26, bottom: 15 },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 8
      );
      doc.text(
        'Relatório de Chamados Jira',
        14,
        doc.internal.pageSize.height - 8
      );
    },
  });

  doc.save(filename);
}
