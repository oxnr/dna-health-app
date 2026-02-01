/**
 * Comprehensive DNA Analyzer
 * Full feature parity with Python genetic-health pipeline
 * 
 * Uses:
 * - Comprehensive SNP Database (~200 curated SNPs)
 * - ClinVar Database (85K pathogenic/risk variants)
 * - PharmGKB (2840 drug-gene interactions)
 */

import { parseGenome, type ParsedGenome } from './parser';
import { COMPREHENSIVE_SNPS } from './comprehensiveSnpDatabase';
import type { AnalysisResults, SNPResult, DrugInteraction, DiseaseRisk } from '$lib/stores/app';

// Lazy-loaded databases
let clinvarData: Record<string, ClinVarEntry> | null = null;
let pharmgkbData: Record<string, PharmGKBEntry[]> | null = null;

interface ClinVarEntry {
  ref: string;
  alt: string;
  gene: string;
  sig: string;
  condition: string;
  stars: number;
}

interface PharmGKBEntry {
  gene: string;
  level: string;
  drugs: string;
  phenotype: string;
  annotation: string;
}

export interface ComprehensiveProgress {
  stage: string;
  progress: number;
  message: string;
}

export type ProgressCallback = (progress: ComprehensiveProgress) => void;

/**
 * Load ClinVar database (lazy, cached)
 */
async function loadClinVar(): Promise<Record<string, ClinVarEntry>> {
  if (clinvarData) return clinvarData;
  
  const response = await fetch('/data/clinvar.json');
  clinvarData = await response.json();
  return clinvarData!;
}

/**
 * Load PharmGKB database (lazy, cached)
 */
async function loadPharmGKB(): Promise<Record<string, PharmGKBEntry[]>> {
  if (pharmgkbData) return pharmgkbData;
  
  const response = await fetch('/data/pharmgkb.json');
  pharmgkbData = await response.json();
  return pharmgkbData!;
}

/**
 * Get impact level from magnitude
 */
function getMagnitudeImpact(magnitude: number): 'high' | 'moderate' | 'low' | 'info' {
  if (magnitude >= 3) return 'high';
  if (magnitude >= 2) return 'moderate';
  if (magnitude >= 1) return 'low';
  return 'info';
}

/**
 * Analyze against comprehensive SNP database
 */
function analyzeComprehensiveSNPs(genome: ParsedGenome): SNPResult[] {
  const findings: SNPResult[] = [];
  
  for (const [rsid, entry] of Object.entries(COMPREHENSIVE_SNPS)) {
    const snpData = genome.snps.get(rsid.toLowerCase());
    
    if (snpData) {
      const genotype = snpData.genotype.toUpperCase();
      
      // Try exact match first
      let variantInfo = entry.variants[genotype];
      
      // Try reverse complement
      if (!variantInfo) {
        const reversed = genotype.split('').reverse().join('');
        variantInfo = entry.variants[reversed];
      }
      
      // Try common allele combinations
      if (!variantInfo && genotype.length === 2) {
        const alleles = genotype.split('');
        const combos = [
          alleles.join(''),
          alleles.reverse().join(''),
          alleles[0] + alleles[0],
          alleles[1] + alleles[1]
        ];
        for (const combo of combos) {
          if (entry.variants[combo]) {
            variantInfo = entry.variants[combo];
            break;
          }
        }
      }
      
      if (variantInfo) {
        findings.push({
          rsid: rsid.toUpperCase(),
          gene: entry.gene,
          category: entry.category,
          genotype: snpData.genotype,
          status: variantInfo.status,
          description: variantInfo.desc,
          magnitude: variantInfo.magnitude,
          impact: getMagnitudeImpact(variantInfo.magnitude)
        });
      }
    }
  }
  
  // Sort by magnitude descending
  findings.sort((a, b) => b.magnitude - a.magnitude);
  
  return findings;
}

/**
 * Analyze against ClinVar database
 */
async function analyzeClinVar(genome: ParsedGenome, onProgress?: ProgressCallback): Promise<DiseaseRisk[]> {
  onProgress?.({ stage: 'clinvar', progress: 50, message: 'Loading ClinVar database...' });
  
  const clinvar = await loadClinVar();
  const risks: DiseaseRisk[] = [];
  
  onProgress?.({ stage: 'clinvar', progress: 60, message: 'Scanning for disease variants...' });
  
  // Build position lookup from genome
  const positionMap = new Map<string, { rsid: string; genotype: string }>();
  for (const [rsid, data] of genome.snps) {
    const key = `${data.chromosome}:${data.position}`;
    positionMap.set(key, { rsid, genotype: data.genotype });
  }
  
  // Scan ClinVar
  let checked = 0;
  const total = Object.keys(clinvar).length;
  
  for (const [posKey, entry] of Object.entries(clinvar)) {
    checked++;
    
    if (checked % 10000 === 0) {
      onProgress?.({ 
        stage: 'clinvar', 
        progress: 60 + (checked / total) * 20, 
        message: `Scanning variants ${checked.toLocaleString()}/${total.toLocaleString()}...` 
      });
    }
    
    const userData = positionMap.get(posKey);
    if (!userData) continue;
    
    // Check if user has the variant allele
    const userAlleles = userData.genotype.toUpperCase().split('');
    const hasVariant = userAlleles.includes(entry.alt.toUpperCase());
    
    if (hasVariant) {
      const sig = entry.sig.toLowerCase();
      let significance = 'unknown';
      
      if (sig.includes('pathogenic') && !sig.includes('likely')) {
        significance = 'Pathogenic';
      } else if (sig.includes('likely_pathogenic') || sig.includes('likely pathogenic')) {
        significance = 'Likely Pathogenic';
      } else if (sig.includes('risk')) {
        significance = 'Risk Factor';
      } else if (sig.includes('drug')) {
        significance = 'Drug Response';
      } else if (sig.includes('protective')) {
        significance = 'Protective';
      }
      
      risks.push({
        rsid: userData.rsid.toUpperCase(),
        gene: entry.gene || 'Unknown',
        condition: entry.condition || 'Not specified',
        significance,
        interpretation: `${entry.sig} (${entry.stars} star${entry.stars !== 1 ? 's' : ''} review)`
      });
    }
  }
  
  // Sort by significance
  const sigOrder = ['Pathogenic', 'Likely Pathogenic', 'Risk Factor', 'Drug Response', 'Protective'];
  risks.sort((a, b) => sigOrder.indexOf(a.significance) - sigOrder.indexOf(b.significance));
  
  return risks;
}

/**
 * Analyze against PharmGKB database
 */
async function analyzePharmGKB(genome: ParsedGenome, onProgress?: ProgressCallback): Promise<DrugInteraction[]> {
  onProgress?.({ stage: 'pharmgkb', progress: 85, message: 'Checking drug interactions...' });
  
  const pharmgkb = await loadPharmGKB();
  const interactions: DrugInteraction[] = [];
  
  for (const [rsid, entries] of Object.entries(pharmgkb)) {
    const snpData = genome.snps.get(rsid.toLowerCase());
    
    if (snpData) {
      for (const entry of entries) {
        // Prioritize by evidence level
        const level = entry.level || '3';
        
        interactions.push({
          rsid: rsid.toUpperCase(),
          gene: entry.gene,
          drugs: entry.drugs.split(';').map(d => d.trim()).filter(d => d),
          level,
          recommendation: entry.annotation || entry.phenotype || 'See PharmGKB for details'
        });
      }
    }
  }
  
  // Sort by evidence level (1A, 1B, 2A, 2B, 3, 4)
  interactions.sort((a, b) => a.level.localeCompare(b.level));
  
  // Deduplicate by gene
  const seen = new Set<string>();
  const unique: DrugInteraction[] = [];
  for (const interaction of interactions) {
    const key = `${interaction.gene}-${interaction.level}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(interaction);
    }
  }
  
  return unique;
}

/**
 * Run comprehensive analysis (full feature parity with Python)
 */
export async function analyzeGenomeComprehensive(
  fileContent: string,
  onProgress?: ProgressCallback
): Promise<AnalysisResults> {
  // Step 1: Parse genome
  onProgress?.({ stage: 'parsing', progress: 5, message: 'Parsing DNA file...' });
  const genome = parseGenome(fileContent);
  
  if (genome.snpCount === 0) {
    throw new Error('No valid SNPs found in file');
  }
  
  onProgress?.({ stage: 'parsing', progress: 10, message: `Loaded ${genome.snpCount.toLocaleString()} SNPs` });
  
  // Step 2: Analyze against comprehensive SNP database
  onProgress?.({ stage: 'snps', progress: 20, message: 'Analyzing health markers...' });
  const findings = analyzeComprehensiveSNPs(genome);
  
  onProgress?.({ stage: 'snps', progress: 40, message: `Found ${findings.length} health findings` });
  
  // Step 3: Analyze against ClinVar
  const diseaseRisks = await analyzeClinVar(genome, onProgress);
  
  // Step 4: Analyze against PharmGKB
  const drugInteractions = await analyzePharmGKB(genome, onProgress);
  
  onProgress?.({ stage: 'complete', progress: 100, message: 'Analysis complete' });
  
  return {
    snpsAnalyzed: genome.snpCount,
    snpsTotal: genome.snpCount,
    findings,
    drugInteractions,
    diseaseRisks,
    timestamp: new Date()
  };
}
