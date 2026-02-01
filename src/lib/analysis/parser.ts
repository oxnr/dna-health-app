/**
 * DNA File Parser
 * Supports: 23andMe, AncestryDNA, MyHeritage, Nebula, FamilyTreeDNA
 * 
 * Security considerations:
 * - File size limits enforced
 * - Line count limits enforced
 * - Input sanitization on all parsed values
 * - No eval or dynamic code execution
 */

// Security constants
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB max (typical 23andMe is ~25MB)
export const MAX_LINE_COUNT = 2_000_000; // 2M lines max (typical is ~600K)
const MAX_GENOTYPE_LENGTH = 10; // Genotypes should be 1-2 chars, max 10 for safety
const VALID_RSID_PATTERN = /^rs\d{1,12}$/i;
const VALID_CHROMOSOME_PATTERN = /^(chr)?(1?[0-9]|2[0-2]|[XYMxy]|MT)$/i;
const VALID_GENOTYPE_PATTERN = /^[ACGTacgt\-0]+$/;

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
      const cleanedRsid = rsid?.trim();
      const cleanedGenotype = sanitizeGenotype(genotype);
      if (cleanedRsid && cleanedGenotype && isValidRsid(cleanedRsid) && VALID_CHROMOSOME_PATTERN.test(chromosome)) {
        snps.set(cleanedRsid.toLowerCase(), {
          chromosome,
          position,
          genotype: cleanedGenotype
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
      const cleanedRsid = rsid?.trim();
      const genotype = allele1 && allele2 ? `${allele1}${allele2}` : '';
      const cleanedGenotype = sanitizeGenotype(genotype);
      if (cleanedRsid && cleanedGenotype && isValidRsid(cleanedRsid) && VALID_CHROMOSOME_PATTERN.test(chromosome)) {
        snps.set(cleanedRsid.toLowerCase(), {
          chromosome,
          position,
          genotype: cleanedGenotype
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
      const cleanedRsid = rsid?.trim();
      const cleanedGenotype = sanitizeGenotype(result);
      if (cleanedRsid && cleanedGenotype && isValidRsid(cleanedRsid) && VALID_CHROMOSOME_PATTERN.test(chromosome)) {
        snps.set(cleanedRsid.toLowerCase(), {
          chromosome,
          position,
          genotype: cleanedGenotype
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
        
        const cleanedGenotype = sanitizeGenotype(genotype);
        const cleanedChrom = chrom.replace('chr', '');
        if (
          cleanedGenotype &&
          !genotype.includes('.') &&
          isValidRsid(id) &&
          VALID_CHROMOSOME_PATTERN.test(cleanedChrom)
        ) {
          snps.set(id.toLowerCase(), {
            chromosome: cleanedChrom,
            position: pos,
            genotype: cleanedGenotype
          });
        }
      }
    }
  }
  
  return { snps, format: 'VCF', snpCount: snps.size };
}

/**
 * Sanitize and validate a genotype string
 */
function sanitizeGenotype(genotype: string): string | null {
  if (!genotype || genotype.length > MAX_GENOTYPE_LENGTH) return null;
  const cleaned = genotype.trim().toUpperCase();
  if (cleaned === '--' || cleaned === '00' || cleaned === '') return null;
  if (!VALID_GENOTYPE_PATTERN.test(cleaned)) return null;
  return cleaned;
}

/**
 * Validate rsID format
 */
function isValidRsid(rsid: string): boolean {
  return VALID_RSID_PATTERN.test(rsid);
}

/**
 * Main parser entry point with security validation
 */
export function parseGenome(content: string): ParsedGenome {
  // Security: Check file size
  const fileSize = new Blob([content]).size;
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File too large (${Math.round(fileSize / 1024 / 1024)}MB). Maximum allowed: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
  }
  
  // Security: Check line count
  const lineCount = content.split('\n').length;
  if (lineCount > MAX_LINE_COUNT) {
    throw new Error(`File has too many lines (${lineCount.toLocaleString()}). Maximum allowed: ${MAX_LINE_COUNT.toLocaleString()}`);
  }
  
  const format = detectFormat(content);
  
  let result: ParsedGenome;
  
  switch (format) {
    case '23andme':
    case 'nebula':
    case 'ftdna':
      result = parse23andMe(content);
      break;
    case 'ancestry':
      result = parseAncestry(content);
      break;
    case 'myheritage':
      result = parseMyHeritage(content);
      break;
    case 'vcf':
      result = parseVCF(content);
      break;
    default:
      // Try 23andMe format as fallback
      result = parse23andMe(content);
      if (result.snpCount > 0) {
        result = { ...result, format: 'Unknown (parsed as 23andMe)' };
        break;
      }
      throw new Error('Unrecognized file format');
  }
  
  // Security: Validate we got reasonable results
  if (result.snpCount === 0) {
    throw new Error('No valid SNPs found in file');
  }
  
  if (result.snpCount > MAX_LINE_COUNT) {
    throw new Error('Parsed data exceeds expected limits');
  }
  
  return result;
}

export function normalizeGenotype(genotype: string): string {
  // Sort alleles alphabetically for consistent matching
  const alleles = genotype.split('').sort();
  return alleles.join('');
}
