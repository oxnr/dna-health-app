import { describe, it, expect } from 'vitest';
import { parseGenome } from './parser';

describe('parseGenome', () => {
  it('parses 23andMe format and skips invalid entries', () => {
    const content = [
      '# rsid\tchromosome\tposition\tgenotype',
      'rs123\t1\t12345\tAG',
      'rs999\t2\t54321\t--',
      'notrs\t1\t111\tAA'
    ].join('\n');

    const result = parseGenome(content);

    expect(result.format).toBe('23andMe');
    expect(result.snpCount).toBe(1);
    expect(result.snps.get('rs123')?.genotype).toBe('AG');
  });

  it('parses AncestryDNA format', () => {
    const content = [
      '# AncestryDNA raw data',
      'rs456\t1\t222\tA\tG'
    ].join('\n');

    const result = parseGenome(content);

    expect(result.format).toBe('AncestryDNA');
    expect(result.snps.get('rs456')?.genotype).toBe('AG');
  });

  it('parses VCF format', () => {
    const content = [
      '##fileformat=VCFv4.2',
      '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE',
      '1\t123\trs789\tA\tG\t.\t.\t.\tGT\t0/1'
    ].join('\n');

    const result = parseGenome(content);

    expect(result.format).toBe('VCF');
    expect(result.snps.get('rs789')?.genotype).toBe('AG');
  });

  it('throws on unrecognized format', () => {
    expect(() => parseGenome('totally unknown')).toThrow('Unrecognized file format');
  });
});
