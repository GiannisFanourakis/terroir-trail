import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  downloadIntentEvidenceCsv,
  downloadRegionalEvidenceCsv,
  downloadIntentEvidenceExcel,
  downloadRegionalEvidenceExcel,
  printIntentEvidencePdf,
  printRegionalEvidencePdf,
} from './adminEvidenceExport';

describe('admin evidence export', () => {
  it('exposes the three human-readable formats for both evidence reports', () => {
    expect(downloadIntentEvidenceCsv).toBeTypeOf('function');
    expect(downloadRegionalEvidenceCsv).toBeTypeOf('function');
    expect(downloadIntentEvidenceExcel).toBeTypeOf('function');
    expect(downloadRegionalEvidenceExcel).toBeTypeOf('function');
    expect(printIntentEvidencePdf).toBeTypeOf('function');
    expect(printRegionalEvidencePdf).toBeTypeOf('function');
  });

  it('ships the on-demand export module with readable report sections and caveats', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'public', 'admin-evidence-export.js'),
      'utf8'
    );
    expect(source).toContain('Producer intent');
    expect(source).toContain('Regional readiness');
    expect(source).toContain('Traveler demand');
    expect(source).toContain('not bookings, visits or purchases');
    expect(source).toContain('Curated, non-exhaustive coverage');
  });
});
