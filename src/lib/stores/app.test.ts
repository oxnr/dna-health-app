import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { analysisState, selectedCategory, filteredFindings, type AnalysisResults } from './app';

describe('filteredFindings', () => {
  beforeEach(() => {
    analysisState.set({ status: 'idle' });
    selectedCategory.set('all');
  });

  it('filters findings by mapped categories', () => {
    const results: AnalysisResults = {
      snpsAnalyzed: 2,
      snpsTotal: 2,
      findings: [
        {
          rsid: 'RS1',
          gene: 'GENE1',
          category: 'Drug Metabolism',
          genotype: 'AG',
          status: 'intermediate',
          description: 'desc',
          magnitude: 2,
          impact: 'moderate'
        },
        {
          rsid: 'RS2',
          gene: 'GENE2',
          category: 'Skin',
          genotype: 'CC',
          status: 'normal',
          description: 'desc',
          magnitude: 1,
          impact: 'low'
        }
      ],
      drugInteractions: [],
      diseaseRisks: [],
      timestamp: new Date()
    };

    analysisState.set({ status: 'complete', results });
    selectedCategory.set('pharma');

    const filtered = get(filteredFindings);
    expect(filtered.length).toBe(1);
    expect(filtered[0].category).toBe('Drug Metabolism');
  });
});
