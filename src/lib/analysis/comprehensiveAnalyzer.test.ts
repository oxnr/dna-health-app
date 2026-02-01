import { describe, it, expect, vi, afterEach } from 'vitest';
import { analyzeGenomeComprehensive } from './comprehensiveAnalyzer';

describe('analyzeGenomeComprehensive', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('matches SNPs using allele-combination fallback logic', async () => {
    vi.stubGlobal('fetch', async () => ({
      json: async () => ({})
    }) as Response);

    const content = [
      '# rsid\tchromosome\tposition\tgenotype',
      'rs762551\t1\t12345\tAG'
    ].join('\n');

    const result = await analyzeGenomeComprehensive(content);

    expect(result.findings.length).toBe(1);
    expect(result.findings[0].rsid).toBe('RS762551');
    expect(result.findings[0].status).toBe('fast');
    expect(result.diseaseRisks).toEqual([]);
    expect(result.drugInteractions).toEqual([]);
  });
});
