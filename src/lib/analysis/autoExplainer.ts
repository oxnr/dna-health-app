/**
 * Auto-Explanation Generator
 * Generates human-readable explanations for ANY SNP from ClinVar/PharmGKB
 * This makes whatsmydna work for all DNA types without manual curation
 */

/**
 * Gene function database - explains what genes do in simple terms
 */
const GENE_FUNCTIONS: Record<string, string> = {
  // Cancer genes
  'BRCA1': 'repairs DNA damage, prevents breast/ovarian cancer',
  'BRCA2': 'repairs DNA damage, prevents breast/ovarian cancer',
  'TP53': 'tumor suppressor, the "guardian of the genome"',
  'APC': 'prevents colon polyps and colorectal cancer',
  'MLH1': 'repairs DNA mismatches, prevents Lynch syndrome cancers',
  'MSH2': 'repairs DNA mismatches, prevents Lynch syndrome cancers',
  'MSH6': 'repairs DNA mismatches, prevents colorectal cancer',
  'PTEN': 'tumor suppressor, prevents multiple cancer types',
  'RB1': 'regulates cell division, prevents retinoblastoma',
  'VHL': 'regulates oxygen response, prevents kidney cancer',
  'MEN1': 'tumor suppressor for endocrine glands',
  'RET': 'regulates cell growth, thyroid cancer when mutated',
  'CDH1': 'cell adhesion, prevents hereditary stomach cancer',
  'PALB2': 'helps BRCA2 repair DNA, breast cancer risk',
  'CHEK2': 'DNA damage checkpoint, breast cancer risk',
  'ATM': 'DNA repair coordinator, cancer risk when mutated',
  
  // Cardiovascular
  'LDLR': 'removes LDL cholesterol from blood',
  'APOB': 'main protein in LDL cholesterol particles',
  'PCSK9': 'regulates cholesterol receptor recycling',
  'MYBPC3': 'heart muscle structure and contraction',
  'MYH7': 'heart muscle protein, cardiomyopathy when mutated',
  'SCN5A': 'heart electrical signals, arrhythmia risk',
  'KCNQ1': 'heart rhythm regulation',
  'KCNH2': 'heart rhythm, Long QT syndrome when mutated',
  'LMNA': 'cell structure, can cause cardiomyopathy',
  'TTN': 'largest human protein, heart/muscle function',
  
  // Blood disorders
  'HBB': 'makes hemoglobin beta chain, carries oxygen',
  'HBA1': 'makes hemoglobin alpha chain',
  'HBA2': 'makes hemoglobin alpha chain',
  'F5': 'blood clotting factor V',
  'F2': 'prothrombin, blood clotting',
  'G6PD': 'protects red blood cells from damage',
  
  // Metabolism
  'CFTR': 'chloride channel, cystic fibrosis when mutated',
  'PAH': 'breaks down phenylalanine amino acid',
  'GBA': 'breaks down fats in cells, Gaucher disease when mutated',
  'GAA': 'breaks down glycogen, Pompe disease when mutated',
  'HEXA': 'breaks down fats in brain, Tay-Sachs when mutated',
  'IDUA': 'breaks down complex sugars',
  
  // Neurological
  'HTT': 'brain function, Huntington disease when expanded',
  'SMN1': 'motor neuron survival, spinal muscular atrophy',
  'MECP2': 'brain development, Rett syndrome when mutated',
  'FMR1': 'brain development, Fragile X when expanded',
  'APP': 'brain protein, Alzheimer risk',
  'PSEN1': 'processes proteins, early-onset Alzheimer',
  'PSEN2': 'processes proteins, early-onset Alzheimer',
  'SNCA': 'brain protein, Parkinson risk',
  'LRRK2': 'brain signaling, Parkinson risk',
  'GJB2': 'ear cell connections, hearing loss when mutated',
  
  // Drug metabolism (CYP family)
  'CYP2D6': 'metabolizes ~25% of all drugs',
  'CYP2C19': 'metabolizes antidepressants, PPIs, clopidogrel',
  'CYP2C9': 'metabolizes warfarin, NSAIDs',
  'CYP3A4': 'metabolizes ~50% of all drugs',
  'CYP3A5': 'metabolizes tacrolimus, some statins',
  'CYP1A2': 'metabolizes caffeine, some drugs',
  'CYP2B6': 'metabolizes efavirenz, methadone',
  'CYP2A6': 'metabolizes nicotine',
  'DPYD': 'metabolizes 5-FU chemotherapy',
  'TPMT': 'metabolizes thiopurine drugs',
  'NUDT15': 'affects thiopurine toxicity',
  'UGT1A1': 'metabolizes bilirubin and some drugs',
  'NAT2': 'metabolizes isoniazid, some drugs',
  'SLCO1B1': 'transports statins into liver',
  'VKORC1': 'vitamin K cycle, warfarin target',
  
  // Immune/HLA
  'HLA-A': 'immune system, presents proteins to T cells',
  'HLA-B': 'immune system, drug hypersensitivity risk',
  'HLA-C': 'immune system marker',
  'HLA-DRB1': 'immune system, autoimmune disease risk',
  'HLA-DQB1': 'immune system, celiac/diabetes risk',
  
  // Common metabolic
  'MTHFR': 'folate metabolism, homocysteine levels',
  'HFE': 'iron absorption regulation',
  'APOE': 'cholesterol transport, Alzheimer risk',
  'LCT': 'lactase enzyme persistence',
  'MCM6': 'regulates lactase gene',
  'ALDH2': 'alcohol metabolism',
  'ADH1B': 'alcohol metabolism speed',
  'FTO': 'energy balance, obesity risk',
  'MC4R': 'appetite regulation',
  'COMT': 'breaks down dopamine/adrenaline',
  'BDNF': 'brain growth factor',
  'ACTN3': 'fast-twitch muscle fiber protein',
};

/**
 * Drug class explanations
 */
const DRUG_CLASSES: Record<string, string> = {
  'warfarin': 'blood thinner - prevents clots',
  'clopidogrel': 'blood thinner - prevents heart attacks/strokes',
  'simvastatin': 'cholesterol medication',
  'atorvastatin': 'cholesterol medication',
  'rosuvastatin': 'cholesterol medication',
  'omeprazole': 'acid reflux/heartburn medication',
  'pantoprazole': 'acid reflux medication',
  'codeine': 'pain medication',
  'tramadol': 'pain medication',
  'tamoxifen': 'breast cancer treatment/prevention',
  'fluorouracil': 'chemotherapy drug',
  '5-fu': 'chemotherapy drug',
  'capecitabine': 'chemotherapy drug',
  'irinotecan': 'chemotherapy drug',
  'azathioprine': 'immune suppressant',
  '6-mercaptopurine': 'immune suppressant/leukemia drug',
  'thiopurine': 'immune suppressant class',
  'methotrexate': 'immune suppressant/cancer drug',
  'tacrolimus': 'organ transplant drug',
  'abacavir': 'HIV medication',
  'carbamazepine': 'seizure/mood medication',
  'phenytoin': 'seizure medication',
  'efavirenz': 'HIV medication',
  'methadone': 'opioid addiction treatment',
  'sertraline': 'antidepressant',
  'citalopram': 'antidepressant',
  'escitalopram': 'antidepressant',
  'amitriptyline': 'antidepressant/pain medication',
  'nortriptyline': 'antidepressant',
  'voriconazole': 'antifungal medication',
  'isoniazid': 'tuberculosis medication',
};

/**
 * Generate explanation for a ClinVar variant
 */
export function explainClinVarVariant(
  gene: string,
  condition: string,
  significance: string,
  stars: number
): string {
  const geneInfo = GENE_FUNCTIONS[gene.toUpperCase()] || 'affects cellular function';
  const confidence = stars >= 2 ? 'well-established' : 'reported but needs more research';
  
  // Parse significance
  const sigLower = significance.toLowerCase();
  let impact = '';
  let action = '';
  
  if (sigLower.includes('pathogenic') && !sigLower.includes('likely')) {
    impact = 'is a disease-causing variant';
    action = 'Consult a genetic counselor';
  } else if (sigLower.includes('likely_pathogenic') || sigLower.includes('likely pathogenic')) {
    impact = 'is probably disease-causing';
    action = 'Consider genetic counseling';
  } else if (sigLower.includes('risk')) {
    impact = 'increases disease risk';
    action = 'Discuss with your doctor';
  } else if (sigLower.includes('protective')) {
    impact = 'may be protective';
    action = 'No action needed';
  } else if (sigLower.includes('drug')) {
    impact = 'affects drug response';
    action = 'Share with your pharmacist';
  } else {
    impact = 'has uncertain significance';
    action = 'Monitor for updates';
  }
  
  // Clean up condition name
  const cleanCondition = condition
    .replace(/not provided|not specified/gi, 'an unspecified condition')
    .replace(/_/g, ' ')
    .toLowerCase();
  
  return `${gene} gene (${geneInfo}) ${impact} for ${cleanCondition}. This finding is ${confidence} (${stars}-star review). ${action}.`;
}

/**
 * Generate explanation for a PharmGKB drug interaction
 */
export function explainDrugInteraction(
  gene: string,
  drugs: string[],
  level: string,
  phenotype: string
): string {
  const geneInfo = GENE_FUNCTIONS[gene.toUpperCase()] || 'metabolizes medications';
  
  // Explain drugs in simple terms
  const drugExplanations = drugs.slice(0, 3).map(drug => {
    const drugLower = drug.toLowerCase();
    for (const [key, desc] of Object.entries(DRUG_CLASSES)) {
      if (drugLower.includes(key)) {
        return `${drug} (${desc})`;
      }
    }
    return drug;
  });
  
  // Evidence level explanation
  let evidenceStr = '';
  switch (level) {
    case '1A':
      evidenceStr = 'Strong clinical evidence with guidelines - FOLLOW THIS';
      break;
    case '1B':
      evidenceStr = 'Strong clinical evidence - important to follow';
      break;
    case '2A':
      evidenceStr = 'Moderate evidence - discuss with doctor';
      break;
    case '2B':
      evidenceStr = 'Moderate evidence - consider discussing';
      break;
    case '3':
      evidenceStr = 'Emerging evidence - be aware';
      break;
    default:
      evidenceStr = 'Preliminary evidence';
  }
  
  const drugList = drugExplanations.join(', ');
  const moreCount = drugs.length > 3 ? ` and ${drugs.length - 3} more` : '';
  
  return `Your ${gene} variant (${geneInfo}) affects how you process: ${drugList}${moreCount}. Evidence: ${evidenceStr}. ${phenotype || ''}`.trim();
}

/**
 * Generate a category from gene name
 */
export function inferCategory(gene: string, condition: string): string {
  const g = gene.toUpperCase();
  const c = condition.toLowerCase();
  
  // Cancer genes
  if (['BRCA1', 'BRCA2', 'TP53', 'APC', 'MLH1', 'MSH2', 'PTEN', 'RB1', 'VHL', 'CDH1', 'PALB2', 'CHEK2', 'ATM'].includes(g)) {
    return 'Cancer Risk';
  }
  
  // Cardiovascular
  if (['LDLR', 'APOB', 'PCSK9', 'MYBPC3', 'MYH7', 'SCN5A', 'KCNQ1', 'KCNH2', 'LMNA', 'TTN', 'LPA'].includes(g) ||
      c.includes('cardio') || c.includes('heart') || c.includes('arrhythmia')) {
    return 'Cardiovascular';
  }
  
  // Drug metabolism
  if (g.startsWith('CYP') || ['DPYD', 'TPMT', 'NUDT15', 'UGT1A1', 'NAT2', 'SLCO1B1', 'VKORC1'].includes(g)) {
    return 'Drug Metabolism';
  }
  
  // Blood disorders
  if (['HBB', 'HBA1', 'HBA2', 'F5', 'F2', 'G6PD'].includes(g) ||
      c.includes('anemia') || c.includes('thalassemia') || c.includes('clotting')) {
    return 'Blood Disorders';
  }
  
  // Neurological
  if (['HTT', 'SMN1', 'MECP2', 'FMR1', 'APP', 'PSEN1', 'PSEN2', 'SNCA', 'LRRK2', 'GJB2'].includes(g) ||
      c.includes('alzheimer') || c.includes('parkinson') || c.includes('neurolog')) {
    return 'Neurological';
  }
  
  // Immune
  if (g.startsWith('HLA') || c.includes('autoimmune') || c.includes('immune')) {
    return 'Immune System';
  }
  
  // Metabolic
  if (['CFTR', 'PAH', 'GBA', 'GAA', 'HEXA', 'IDUA', 'HFE', 'MTHFR'].includes(g)) {
    return 'Metabolic Disorders';
  }
  
  // Default based on condition keywords
  if (c.includes('cancer') || c.includes('tumor') || c.includes('carcinoma')) return 'Cancer Risk';
  if (c.includes('diabetes')) return 'Diabetes';
  if (c.includes('kidney') || c.includes('renal')) return 'Kidney';
  if (c.includes('liver') || c.includes('hepatic')) return 'Liver';
  if (c.includes('lung') || c.includes('pulmonary')) return 'Respiratory';
  if (c.includes('eye') || c.includes('vision') || c.includes('retina')) return 'Eye Health';
  if (c.includes('skin') || c.includes('derma')) return 'Skin';
  if (c.includes('bone') || c.includes('osteo')) return 'Bone Health';
  
  return 'Other';
}

/**
 * Get severity score for prioritization
 */
export function getSeverityScore(significance: string, stars: number): number {
  const sigLower = significance.toLowerCase();
  let base = 0;
  
  if (sigLower.includes('pathogenic') && !sigLower.includes('likely')) {
    base = 5;
  } else if (sigLower.includes('likely_pathogenic') || sigLower.includes('likely pathogenic')) {
    base = 4;
  } else if (sigLower.includes('risk')) {
    base = 3;
  } else if (sigLower.includes('drug')) {
    base = 2;
  } else if (sigLower.includes('protective')) {
    base = 1;
  }
  
  // Boost for higher star ratings
  return base + (stars * 0.5);
}
