import type { AdminIntentMetrics, AdminRegionalIntelligence } from '../services/adminApi';

type ExportModule = {
  downloadIntentEvidenceCsv: (filename: string, metrics: AdminIntentMetrics) => void;
  downloadRegionalEvidenceCsv: (filename: string, report: AdminRegionalIntelligence) => void;
  downloadIntentEvidenceExcel: (filename: string, metrics: AdminIntentMetrics) => void;
  downloadRegionalEvidenceExcel: (filename: string, report: AdminRegionalIntelligence) => void;
  printIntentEvidencePdf: (metrics: AdminIntentMetrics) => void;
  printRegionalEvidencePdf: (report: AdminRegionalIntelligence) => void;
};

let modulePromise: Promise<ExportModule> | null = null;

const loadExportModule = (): Promise<ExportModule> => {
  if (!modulePromise) {
    const url = '/admin-evidence-export.js?v=20261003-2';
    modulePromise = import(/* @vite-ignore */ url) as Promise<ExportModule>;
  }
  return modulePromise;
};

export const downloadIntentEvidenceCsv = async (
  filename: string,
  metrics: AdminIntentMetrics
): Promise<void> => {
  (await loadExportModule()).downloadIntentEvidenceCsv(filename, metrics);
};

export const downloadRegionalEvidenceCsv = async (
  filename: string,
  report: AdminRegionalIntelligence
): Promise<void> => {
  (await loadExportModule()).downloadRegionalEvidenceCsv(filename, report);
};

export const downloadIntentEvidenceExcel = async (
  filename: string,
  metrics: AdminIntentMetrics
): Promise<void> => {
  (await loadExportModule()).downloadIntentEvidenceExcel(filename, metrics);
};

export const downloadRegionalEvidenceExcel = async (
  filename: string,
  report: AdminRegionalIntelligence
): Promise<void> => {
  (await loadExportModule()).downloadRegionalEvidenceExcel(filename, report);
};

export const printIntentEvidencePdf = async (
  metrics: AdminIntentMetrics
): Promise<void> => {
  (await loadExportModule()).printIntentEvidencePdf(metrics);
};

export const printRegionalEvidencePdf = async (
  report: AdminRegionalIntelligence
): Promise<void> => {
  (await loadExportModule()).printRegionalEvidencePdf(report);
};
