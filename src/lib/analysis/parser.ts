/**
 * DNA File Parser
 * Supports: 23andMe, AncestryDNA, MyHeritage, Nebula, FamilyTreeDNA
 */

export interface ParsedGenome {
  snps: Map<string, SNPData>;
  format: string;
  snpCount: number;
}

export interface SNPData {
  chromosome: string;
  position: string;
  genotype: string;
}

type FileFormat = '23andme' | 'ancestry' | 'myheritage' | 'nebula' | 'ftdna' | 'vcf' | 'unknown';

function detectFormat(content: string): FileFormat {
  const firstLines = content.slice(0, 2000).toLowerCase();
  
  if (firstLines.includes('ancestrydna')) return 'ancestry';
  if (firstLines.includes('myheritage')) return 'myheritage';
  if (firstLines.includes('familytreedna') || firstLines.includes('ftdna')) return 'ftdna';
  if (firstLines.includes('##fileformat=vcf')) return 'vcf';
  if (firstLines.includes('nebula')) return 'nebula';
  if (firstLines.includes('# rsid') || firstLines.includes('#rsid') || 
      (firstLines.includes('rsid') && firstLines.includes('chromosome'))) {
    return '23andme';
  }
  
  // Try to detect by content pattern
  const lines = content.split('\n').slice(0, 20);
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    const parts = line.split(/[\t,]/);
    if (parts.length >= 4 && parts[0].match(/^rs\d+$/i)) {
      return '23andme';
    }
  }
  
  return 'unknown';
}

function parse23andMe(content: string): ParsedGenome {
  const snps = new Map<string, SNPData>();
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') continue;
    
    const parts = line.split('\t');
    if (parts.length >= 4) {
      const [rsid, chromosome, position, genotype] = parts;
      if (genotype && genotype !== '--' && genotype !== '00') {
        snps.set(rsid.toLowerCase(), {
          chromosome,
          position,
          genotype: genotype.toUpperCase()
        });
      }
    }
  }
  
  return { snps, format: '23andMe', snpCount: snps.size };
}

function parseAncestry(content: string): ParsedGenome {
  const snps = new Map<string, SNPData>();
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') continue;
    
    // AncestryDNA format: rsid, chromosome, position, allele1, allele2
    const parts = line.split('\t');
    if (parts.length >= 5) {
      const [rsid, chromosome, position, allele1, allele2] = parts;
      if (allele1 && allele2 && allele1 !== '0' && allele2 !== '0') {
        snps.set(rsid.toLowerCase(), {
          chromosome,
          position,
          genotype: (allele1 + allele2).toUpperCase()
        });
      }
    }
  }
  
  return { snps, format: 'AncestryDNA', snpCount: snps.size };
}

function parseMyHeritage(content: string): ParsedGenome {
  const snps = new Map<string, SNPData>();
  const lines = content.split('\n');
  let isHeader = true;
  
  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') continue;
    if (line.toLowerCase().includes('rsid')) {
      isHeader = false;
      continue;
    }
    if (isHeader) continue;
    
    // MyHeritage CSV format
    const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
    if (parts.length >= 4) {
      const [rsid, chromosome, position, result] = parts;
      if (result && result !== '--') {
        snps.set(rsid.toLowerCase(), {
          chromosome,
          position,
          genotype: result.toUpperCase()
        });
      }
    }
  }
  
  return { snps, format: 'MyHeritage', snpCount: snps.size };
}

function parseVCF(content: string): ParsedGenome {
  const snps = new Map<string, SNPData>();
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') continue;
    
    const parts = line.split('\t');
    if (parts.length >= 10) {
      const [chrom, pos, id, ref, alt, qual, filter, info, format, sample] = parts;
      
      // Parse genotype from sample column
      const formatFields = format.split(':');
      const sampleFields = sample.split(':');
      const gtIndex = formatFields.indexOf('GT');
      
      if (gtIndex >= 0 && id.startsWith('rs')) {
        const gt = sampleFields[gtIndex];
        const alleles = [ref, ...alt.split(',')];
        const indices = gt.replace(/[|/]/g, ',').split(',').map(Number);
        const genotype = indices.map(i => alleles[i] || '.').join('');
        
        if (genotype && !genotype.includes('.')) {
          snps.set(id.toLowerCase(), {
            chromosome: chrom.replace('chr', ''),
            position: pos,
            genotype: genotype.toUpperCase()
          });
        }
      }
    }
  }
  
  return { snps, format: 'VCF', snpCount: snps.size };
}

export function parseGenome(content: string): ParsedGenome {
  const format = detectFormat(content);
  
  switch (format) {
    case '23andme':
    case 'nebula':
    case 'ftdna':
      return parse23andMe(content);
    case 'ancestry':
      return parseAncestry(content);
    case 'myheritage':
      return parseMyHeritage(content);
    case 'vcf':
      return parseVCF(content);
    default:
      // Try 23andMe format as fallback
      const result = parse23andMe(content);
      if (result.snpCount > 0) {
        return { ...result, format: 'Unknown (parsed as 23andMe)' };
      }
      throw new Error('Unrecognized file format');
  }
}

export function normalizeGenotype(genotype: string): string {
  // Sort alleles alphabetically for consistent matching
  const alleles = genotype.split('').sort();
  return alleles.join('');
}
