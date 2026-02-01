/**
 * Main DNA Analysis Engine
 * Runs entirely client-side for privacy
 */

import { parseGenome, type ParsedGenome } from './parser';
import { SNP_DATABASE, lookupSNP, getSNPInfo } from './snpDatabase';
import type { AnalysisResults, SNPResult, DrugInteraction, DiseaseRisk } from '$lib/stores/app';

export interface AnalysisProgress {
  stage: 'parsing' | 'analyzing-snps' | 'analyzing-drugs' | 'analyzing-disease' | 'complete';
  progress: number;
  message: string;
}

export type ProgressCallback = (progress: AnalysisProgress) => void;

function getMagnitudeImpact(magnitude: number): 'high' | 'moderate' | 'low' | 'info' {
  if (magnitude >= 3) return 'high';
  if (magnitude >= 2) return 'moderate';
  if (magnitude >= 1) return 'low';
  return 'info';
}

export async function analyzeGenome(
  fileContent: string,
  onProgress?: ProgressCallback
): Promise<AnalysisResults> {
  // Step 1: Parse the genome file
  onProgress?.({ stage: 'parsing', progress: 10, message: 'Parsing DNA file...' });
  
  const genome = parseGenome(fileContent);
  
  if (genome.snpCount === 0) {
    throw new Error('No valid SNPs found in file');
  }
  
  // Step 2: Analyze against curated SNP database
  onProgress?.({ stage: 'analyzing-snps', progress: 30, message: 'Analyzing health markers...' });
  
  const findings: SNPResult[] = [];
  const snpIds = Object.keys(SNP_DATABASE);
  
  for (let i = 0; i < snpIds.length; i++) {
    const rsid = snpIds[i];
    const snpData = genome.snps.get(rsid);
    
    if (snpData) {
      const entry = getSNPInfo(rsid);
      const result = lookupSNP(rsid, snpData.genotype);
      
      if (entry && result) {
        findings.push({
          rsid: rsid.toUpperCase(),
          gene: entry.gene,
          category: entry.category,
          genotype: snpData.genotype,
          status: result.status,
          description: result.desc,
          magnitude: result.magnitude,
          impact: getMagnitudeImpact(result.magnitude)
        });
      }
    }
    
    // Update progress
    if (i % 10 === 0) {
      onProgress?.({ 
        stage: 'analyzing-snps', 
        progress: 30 + (i / snpIds.length) * 30, 
        message: `Analyzing SNP ${i + 1} of ${snpIds.length}...` 
      });
    }
  }
  
  // Sort by magnitude (highest first)
  findings.sort((a, b) => b.magnitude - a.magnitude);
  
  // Step 3: Analyze drug interactions
  onProgress?.({ stage: 'analyzing-drugs', progress: 70, message: 'Checking drug interactions...' });
  
  const drugInteractions: DrugInteraction[] = [];
  
  // Pharmacogenomics mappings
  const drugMappings: Record<string, { drugs: string[], level: string }> = {
    'rs4244285': { drugs: ['Clopidogrel', 'Proton pump inhibitors', 'SSRIs'], level: '1A' },
    'rs12248560': { drugs: ['Clopidogrel', 'PPIs', 'Voriconazole'], level: '1A' },
    'rs1799853': { drugs: ['Warfarin', 'NSAIDs', 'Celecoxib'], level: '1A' },
    'rs1057910': { drugs: ['Warfarin', 'NSAIDs'], level: '1A' },
    'rs9923231': { drugs: ['Warfarin'], level: '1A' },
    'rs4149056': { drugs: ['Simvastatin', 'Atorvastatin', 'Rosuvastatin'], level: '1A' },
    'rs3892097': { drugs: ['Codeine', 'Tramadol', 'Tamoxifen', 'Ondansetron'], level: '1A' },
    'rs3918290': { drugs: ['Fluorouracil', 'Capecitabine'], level: '1A' },
    'rs1800460': { drugs: ['Azathioprine', 'Mercaptopurine', 'Thioguanine'], level: '1A' },
    'rs762551': { drugs: ['Caffeine', 'Clozapine', 'Theophylline'], level: '2A' },
  };
  
  for (const [rsid, mapping] of Object.entries(drugMappings)) {
    const finding = findings.find(f => f.rsid.toLowerCase() === rsid);
    if (finding && finding.magnitude >= 2) {
      drugInteractions.push({
        rsid: finding.rsid,
        gene: finding.gene,
        drugs: mapping.drugs,
        level: mapping.level,
        recommendation: finding.description
      });
    }
  }
  
  // Step 4: Check disease risk variants
  onProgress?.({ stage: 'analyzing-disease', progress: 85, message: 'Evaluating disease risk...' });
  
  const diseaseRisks: DiseaseRisk[] = [];
  
  // High-impact disease variants
  const diseaseVariants: Record<string, { condition: string, significance: string }> = {
    'rs429358': { condition: 'Alzheimer\'s Disease', significance: 'Risk factor' },
    'rs6025': { condition: 'Venous Thromboembolism', significance: 'Pathogenic' },
    'rs1799963': { condition: 'Venous Thromboembolism', significance: 'Risk factor' },
    'rs7903146': { condition: 'Type 2 Diabetes', significance: 'Risk factor' },
  };
  
  for (const [rsid, disease] of Object.entries(diseaseVariants)) {
    const finding = findings.find(f => f.rsid.toLowerCase() === rsid);
    if (finding && finding.magnitude >= 3) {
      diseaseRisks.push({
        rsid: finding.rsid,
        gene: finding.gene,
        condition: disease.condition,
        significance: disease.significance,
        interpretation: finding.description
      });
    }
  }
  
  // Complete
  onProgress?.({ stage: 'complete', progress: 100, message: 'Analysis complete!' });
  
  return {
    snpsAnalyzed: findings.length,
    snpsTotal: genome.snpCount,
    findings,
    drugInteractions,
    diseaseRisks,
    timestamp: new Date()
  };
}
