/**
 * Curated SNP Database
 * Contains well-studied, actionable genetic variants with interpretations
 */

export interface SNPEntry {
  gene: string;
  category: string;
  variants: Record<string, {
    status: string;
    desc: string;
    magnitude: number;
  }>;
  note?: string;
}

// Comprehensive SNP database - curated from multiple sources
export const SNP_DATABASE: Record<string, SNPEntry> = {
  // ==========================================================================
  // DRUG METABOLISM (Pharmacogenomics)
  // ==========================================================================
  
  'rs762551': {
    gene: 'CYP1A2',
    category: 'Drug Metabolism',
    variants: {
      'AA': { status: 'fast', desc: 'Fast caffeine metabolizer - clears caffeine quickly', magnitude: 1 },
      'AC': { status: 'intermediate', desc: 'Intermediate caffeine metabolizer - ~5-6hr half-life', magnitude: 2 },
      'CA': { status: 'intermediate', desc: 'Intermediate caffeine metabolizer - ~5-6hr half-life', magnitude: 2 },
      'CC': { status: 'slow', desc: 'Slow caffeine metabolizer - caffeine lingers 8-12hrs', magnitude: 3 },
    }
  },
  
  'rs4244285': {
    gene: 'CYP2C19',
    category: 'Drug Metabolism',
    variants: {
      'GG': { status: 'normal', desc: 'Normal CYP2C19 - standard drug metabolism', magnitude: 0 },
      'GA': { status: 'intermediate', desc: 'Intermediate CYP2C19 (*2 carrier) - clopidogrel less effective', magnitude: 3 },
      'AG': { status: 'intermediate', desc: 'Intermediate CYP2C19 (*2 carrier) - clopidogrel less effective', magnitude: 3 },
      'AA': { status: 'poor', desc: 'Poor CYP2C19 (*2/*2) - clopidogrel ineffective, use alternative', magnitude: 4 },
    }
  },
  
  'rs12248560': {
    gene: 'CYP2C19',
    category: 'Drug Metabolism',
    variants: {
      'CC': { status: 'normal', desc: 'Normal CYP2C19 metabolism', magnitude: 0 },
      'CT': { status: 'rapid', desc: 'Rapid CYP2C19 (*17) - faster PPI/antidepressant metabolism', magnitude: 2 },
      'TC': { status: 'rapid', desc: 'Rapid CYP2C19 (*17) - faster PPI/antidepressant metabolism', magnitude: 2 },
      'TT': { status: 'ultrarapid', desc: 'Ultrarapid CYP2C19 (*17/*17) - significantly faster metabolism', magnitude: 3 },
    }
  },
  
  'rs1799853': {
    gene: 'CYP2C9',
    category: 'Drug Metabolism',
    variants: {
      'CC': { status: 'normal', desc: 'Normal CYP2C9 - standard warfarin/NSAID metabolism', magnitude: 0 },
      'CT': { status: 'intermediate', desc: 'Intermediate CYP2C9 (*2) - warfarin dose reduction needed', magnitude: 3 },
      'TC': { status: 'intermediate', desc: 'Intermediate CYP2C9 (*2) - warfarin dose reduction needed', magnitude: 3 },
      'TT': { status: 'poor', desc: 'Poor CYP2C9 (*2/*2) - significant warfarin sensitivity', magnitude: 4 },
    }
  },
  
  'rs1057910': {
    gene: 'CYP2C9',
    category: 'Drug Metabolism',
    variants: {
      'AA': { status: 'normal', desc: 'Normal CYP2C9 function', magnitude: 0 },
      'AC': { status: 'intermediate', desc: 'Intermediate CYP2C9 (*3) - warfarin dose reduction', magnitude: 3 },
      'CA': { status: 'intermediate', desc: 'Intermediate CYP2C9 (*3) - warfarin dose reduction', magnitude: 3 },
      'CC': { status: 'poor', desc: 'Poor CYP2C9 (*3/*3) - high warfarin sensitivity', magnitude: 4 },
    }
  },
  
  'rs9923231': {
    gene: 'VKORC1',
    category: 'Drug Metabolism',
    variants: {
      'GG': { status: 'normal', desc: 'Normal warfarin sensitivity', magnitude: 0 },
      'GA': { status: 'sensitive', desc: 'Increased warfarin sensitivity - lower doses needed', magnitude: 3 },
      'AG': { status: 'sensitive', desc: 'Increased warfarin sensitivity - lower doses needed', magnitude: 3 },
      'AA': { status: 'highly_sensitive', desc: 'Highly warfarin sensitive - significantly lower doses', magnitude: 4 },
    }
  },
  
  'rs4149056': {
    gene: 'SLCO1B1',
    category: 'Drug Metabolism',
    variants: {
      'TT': { status: 'normal', desc: 'Normal statin transport - standard myopathy risk', magnitude: 0 },
      'TC': { status: 'intermediate', desc: 'Intermediate statin transporter - 4x myopathy risk', magnitude: 3 },
      'CT': { status: 'intermediate', desc: 'Intermediate statin transporter - 4x myopathy risk', magnitude: 3 },
      'CC': { status: 'poor', desc: 'Poor statin transporter - 17x myopathy risk, avoid simvastatin', magnitude: 4 },
    }
  },
  
  'rs3892097': {
    gene: 'CYP2D6',
    category: 'Drug Metabolism',
    variants: {
      'GG': { status: 'normal', desc: 'Normal CYP2D6 - standard codeine/tramadol metabolism', magnitude: 0 },
      'GA': { status: 'intermediate', desc: 'Intermediate CYP2D6 - reduced opioid activation', magnitude: 3 },
      'AG': { status: 'intermediate', desc: 'Intermediate CYP2D6 - reduced opioid activation', magnitude: 3 },
      'AA': { status: 'poor', desc: 'Poor CYP2D6 (*4/*4) - codeine ineffective', magnitude: 4 },
    }
  },
  
  'rs3918290': {
    gene: 'DPYD',
    category: 'Drug Metabolism',
    variants: {
      'CC': { status: 'normal', desc: 'Normal DPYD - standard fluoropyrimidine tolerance', magnitude: 0 },
      'CT': { status: 'intermediate', desc: 'Reduced DPYD - 50% dose reduction for 5-FU/capecitabine', magnitude: 5 },
      'TC': { status: 'intermediate', desc: 'Reduced DPYD - 50% dose reduction for 5-FU/capecitabine', magnitude: 5 },
      'TT': { status: 'deficient', desc: 'DPYD deficient - fluoropyrimidines contraindicated', magnitude: 6 },
    }
  },
  
  'rs1800460': {
    gene: 'TPMT',
    category: 'Drug Metabolism',
    variants: {
      'CC': { status: 'normal', desc: 'Normal TPMT - standard thiopurine tolerance', magnitude: 0 },
      'CT': { status: 'intermediate', desc: 'Intermediate TPMT - thiopurine dose reduction needed', magnitude: 4 },
      'TC': { status: 'intermediate', desc: 'Intermediate TPMT - thiopurine dose reduction needed', magnitude: 4 },
      'TT': { status: 'poor', desc: 'Poor TPMT - thiopurines can cause severe toxicity', magnitude: 5 },
    }
  },

  // ==========================================================================
  // METHYLATION
  // ==========================================================================
  
  'rs1801133': {
    gene: 'MTHFR',
    category: 'Methylation',
    variants: {
      'GG': { status: 'normal', desc: 'Normal MTHFR C677 - full methylation capacity', magnitude: 0 },
      'CC': { status: 'normal', desc: 'Normal MTHFR C677 - full methylation capacity', magnitude: 0 },
      'AG': { status: 'reduced', desc: 'MTHFR C677T heterozygous - ~35% reduced activity', magnitude: 2 },
      'GA': { status: 'reduced', desc: 'MTHFR C677T heterozygous - ~35% reduced activity', magnitude: 2 },
      'CT': { status: 'reduced', desc: 'MTHFR C677T heterozygous - ~35% reduced activity', magnitude: 2 },
      'TC': { status: 'reduced', desc: 'MTHFR C677T heterozygous - ~35% reduced activity', magnitude: 2 },
      'AA': { status: 'significantly_reduced', desc: 'MTHFR C677T homozygous - ~70% reduced, methylfolate recommended', magnitude: 3 },
      'TT': { status: 'significantly_reduced', desc: 'MTHFR C677T homozygous - ~70% reduced, methylfolate recommended', magnitude: 3 },
    }
  },
  
  'rs1801131': {
    gene: 'MTHFR',
    category: 'Methylation',
    variants: {
      'AA': { status: 'normal', desc: 'Normal MTHFR A1298 function', magnitude: 0 },
      'TT': { status: 'normal', desc: 'Normal MTHFR A1298 function', magnitude: 0 },
      'AC': { status: 'reduced', desc: 'MTHFR A1298C heterozygous - mild reduction', magnitude: 1 },
      'CA': { status: 'reduced', desc: 'MTHFR A1298C heterozygous - mild reduction', magnitude: 1 },
      'TG': { status: 'reduced', desc: 'MTHFR A1298C heterozygous - mild reduction', magnitude: 1 },
      'GT': { status: 'reduced', desc: 'MTHFR A1298C heterozygous - mild reduction', magnitude: 1 },
      'CC': { status: 'reduced', desc: 'MTHFR A1298C homozygous - moderate reduction in BH4', magnitude: 2 },
      'GG': { status: 'reduced', desc: 'MTHFR A1298C homozygous - moderate reduction in BH4', magnitude: 2 },
    }
  },
  
  'rs1805087': {
    gene: 'MTR',
    category: 'Methylation',
    variants: {
      'AA': { status: 'normal', desc: 'Normal methionine synthase function', magnitude: 0 },
      'AG': { status: 'reduced', desc: 'MTR A2756G heterozygous - reduced B12 utilization', magnitude: 1 },
      'GA': { status: 'reduced', desc: 'MTR A2756G heterozygous - reduced B12 utilization', magnitude: 1 },
      'GG': { status: 'significantly_reduced', desc: 'MTR A2756G homozygous - may need higher B12', magnitude: 2 },
    }
  },

  // ==========================================================================
  // NEUROTRANSMITTERS
  // ==========================================================================
  
  'rs4680': {
    gene: 'COMT',
    category: 'Neurotransmitters',
    variants: {
      'GG': { status: 'warrior', desc: 'COMT Val/Val - fast dopamine breakdown, stress tolerant', magnitude: 2 },
      'AG': { status: 'intermediate', desc: 'COMT Val/Met - balanced dopamine metabolism', magnitude: 1 },
      'GA': { status: 'intermediate', desc: 'COMT Val/Met - balanced dopamine metabolism', magnitude: 1 },
      'AA': { status: 'worrier', desc: 'COMT Met/Met - slow dopamine breakdown, better focus but stress sensitive', magnitude: 2 },
    }
  },
  
  'rs6265': {
    gene: 'BDNF',
    category: 'Neurotransmitters',
    variants: {
      'CC': { status: 'normal', desc: 'Normal BDNF secretion - standard neuroplasticity', magnitude: 0 },
      'CT': { status: 'reduced', desc: 'BDNF Val66Met heterozygous - slightly reduced secretion', magnitude: 1 },
      'TC': { status: 'reduced', desc: 'BDNF Val66Met heterozygous - slightly reduced secretion', magnitude: 1 },
      'TT': { status: 'significantly_reduced', desc: 'BDNF Met/Met - reduced secretion, exercise extra important', magnitude: 2 },
    }
  },
  
  'rs53576': {
    gene: 'OXTR',
    category: 'Neurotransmitters',
    variants: {
      'GG': { status: 'enhanced', desc: 'Enhanced oxytocin receptor - more empathetic, social', magnitude: 1 },
      'AG': { status: 'intermediate', desc: 'Intermediate oxytocin sensitivity', magnitude: 0 },
      'GA': { status: 'intermediate', desc: 'Intermediate oxytocin sensitivity', magnitude: 0 },
      'AA': { status: 'reduced', desc: 'Reduced oxytocin sensitivity - may need more social support', magnitude: 1 },
    }
  },
  
  'rs1800497': {
    gene: 'DRD2/ANKK1',
    category: 'Neurotransmitters',
    variants: {
      'CC': { status: 'normal', desc: 'Normal dopamine receptor density', magnitude: 0 },
      'GG': { status: 'normal', desc: 'Normal dopamine receptor density', magnitude: 0 },
      'CT': { status: 'reduced', desc: 'Reduced D2 receptors - may be more reward-seeking', magnitude: 2 },
      'TC': { status: 'reduced', desc: 'Reduced D2 receptors - may be more reward-seeking', magnitude: 2 },
      'AG': { status: 'reduced', desc: 'Reduced D2 receptors - may be more reward-seeking', magnitude: 2 },
      'GA': { status: 'reduced', desc: 'Reduced D2 receptors - may be more reward-seeking', magnitude: 2 },
      'TT': { status: 'significantly_reduced', desc: 'Significantly reduced D2 receptors', magnitude: 3 },
      'AA': { status: 'significantly_reduced', desc: 'Significantly reduced D2 receptors', magnitude: 3 },
    }
  },

  // ==========================================================================
  // CARDIOVASCULAR
  // ==========================================================================
  
  'rs429358': {
    gene: 'APOE',
    category: 'Cardiovascular',
    variants: {
      'TT': { status: 'e3_base', desc: 'APOE ε3 base - most common allele', magnitude: 0 },
      'TC': { status: 'e4_carrier', desc: 'APOE ε4 carrier - increased cardiovascular and Alzheimer risk', magnitude: 3 },
      'CT': { status: 'e4_carrier', desc: 'APOE ε4 carrier - increased cardiovascular and Alzheimer risk', magnitude: 3 },
      'CC': { status: 'e4_e4', desc: 'APOE ε4/ε4 - significantly increased risk, lifestyle crucial', magnitude: 4 },
    }
  },
  
  'rs7412': {
    gene: 'APOE',
    category: 'Cardiovascular',
    variants: {
      'CC': { status: 'e3_base', desc: 'APOE ε3 base', magnitude: 0 },
      'CT': { status: 'e2_carrier', desc: 'APOE ε2 carrier - may be protective', magnitude: 1 },
      'TC': { status: 'e2_carrier', desc: 'APOE ε2 carrier - may be protective', magnitude: 1 },
      'TT': { status: 'e2_e2', desc: 'APOE ε2/ε2 - protective but monitor triglycerides', magnitude: 2 },
    }
  },
  
  'rs6025': {
    gene: 'F5',
    category: 'Cardiovascular',
    variants: {
      'GG': { status: 'normal', desc: 'No Factor V Leiden mutation', magnitude: 0 },
      'CC': { status: 'normal', desc: 'No Factor V Leiden mutation', magnitude: 0 },
      'GA': { status: 'carrier', desc: 'Factor V Leiden carrier - increased clotting risk', magnitude: 4 },
      'AG': { status: 'carrier', desc: 'Factor V Leiden carrier - increased clotting risk', magnitude: 4 },
      'CT': { status: 'carrier', desc: 'Factor V Leiden carrier - increased clotting risk', magnitude: 4 },
      'TC': { status: 'carrier', desc: 'Factor V Leiden carrier - increased clotting risk', magnitude: 4 },
      'AA': { status: 'homozygous', desc: 'Homozygous Factor V Leiden - high clotting risk', magnitude: 5 },
      'TT': { status: 'homozygous', desc: 'Homozygous Factor V Leiden - high clotting risk', magnitude: 5 },
    }
  },
  
  'rs1799963': {
    gene: 'F2',
    category: 'Cardiovascular',
    variants: {
      'GG': { status: 'normal', desc: 'No prothrombin mutation', magnitude: 0 },
      'GA': { status: 'carrier', desc: 'Prothrombin G20210A carrier - increased clotting risk', magnitude: 3 },
      'AG': { status: 'carrier', desc: 'Prothrombin G20210A carrier - increased clotting risk', magnitude: 3 },
      'AA': { status: 'homozygous', desc: 'Homozygous prothrombin mutation - high clotting risk', magnitude: 4 },
    }
  },

  // ==========================================================================
  // NUTRITION
  // ==========================================================================
  
  'rs4988235': {
    gene: 'MCM6/LCT',
    category: 'Nutrition',
    variants: {
      'GG': { status: 'lactose_intolerant', desc: 'Lactose intolerant - lactase non-persistent', magnitude: 2 },
      'AA': { status: 'lactose_intolerant', desc: 'Lactose intolerant - lactase non-persistent', magnitude: 2 },
      'GA': { status: 'lactose_tolerant', desc: 'Lactose tolerant - lactase persistent', magnitude: 0 },
      'AG': { status: 'lactose_tolerant', desc: 'Lactose tolerant - lactase persistent', magnitude: 0 },
      'GT': { status: 'lactose_tolerant', desc: 'Lactose tolerant - lactase persistent', magnitude: 0 },
      'TG': { status: 'lactose_tolerant', desc: 'Lactose tolerant - lactase persistent', magnitude: 0 },
      'TT': { status: 'lactose_tolerant', desc: 'Lactose tolerant - lactase persistent', magnitude: 0 },
    }
  },
  
  'rs2282679': {
    gene: 'GC',
    category: 'Nutrition',
    variants: {
      'GG': { status: 'normal', desc: 'Normal vitamin D binding protein', magnitude: 0 },
      'TT': { status: 'normal', desc: 'Normal vitamin D binding protein', magnitude: 0 },
      'GT': { status: 'reduced', desc: 'Reduced vitamin D transport - may need higher intake', magnitude: 2 },
      'TG': { status: 'reduced', desc: 'Reduced vitamin D transport - may need higher intake', magnitude: 2 },
      'AC': { status: 'reduced', desc: 'Reduced vitamin D transport - may need higher intake', magnitude: 2 },
      'CA': { status: 'reduced', desc: 'Reduced vitamin D transport - may need higher intake', magnitude: 2 },
      'AA': { status: 'significantly_reduced', desc: 'Significantly reduced vitamin D transport', magnitude: 3 },
      'CC': { status: 'significantly_reduced', desc: 'Significantly reduced vitamin D transport', magnitude: 3 },
    }
  },
  
  'rs7903146': {
    gene: 'TCF7L2',
    category: 'Nutrition',
    variants: {
      'CC': { status: 'normal', desc: 'Normal diabetes risk', magnitude: 0 },
      'CT': { status: 'increased', desc: 'Increased type 2 diabetes risk (~1.4x)', magnitude: 2 },
      'TC': { status: 'increased', desc: 'Increased type 2 diabetes risk (~1.4x)', magnitude: 2 },
      'TT': { status: 'high', desc: 'Higher type 2 diabetes risk (~2x) - lifestyle important', magnitude: 3 },
    }
  },
  
  'rs9939609': {
    gene: 'FTO',
    category: 'Nutrition',
    variants: {
      'TT': { status: 'normal', desc: 'Normal weight regulation', magnitude: 0 },
      'TA': { status: 'increased', desc: 'Slightly increased obesity risk - exercise helps', magnitude: 1 },
      'AT': { status: 'increased', desc: 'Slightly increased obesity risk - exercise helps', magnitude: 1 },
      'AA': { status: 'high', desc: 'Higher obesity risk - diet and exercise extra important', magnitude: 2 },
    }
  },

  // ==========================================================================
  // SLEEP & CIRCADIAN
  // ==========================================================================
  
  'rs1801260': {
    gene: 'CLOCK',
    category: 'Sleep/Circadian',
    variants: {
      'AA': { status: 'normal', desc: 'Normal circadian rhythm', magnitude: 0 },
      'AG': { status: 'evening', desc: 'Tendency toward evening chronotype', magnitude: 1 },
      'GA': { status: 'evening', desc: 'Tendency toward evening chronotype', magnitude: 1 },
      'GG': { status: 'night_owl', desc: 'Strong evening preference - may need sleep hygiene focus', magnitude: 2 },
    }
  },
  
  'rs10830963': {
    gene: 'MTNR1B',
    category: 'Sleep/Circadian',
    variants: {
      'CC': { status: 'normal', desc: 'Normal melatonin signaling', magnitude: 0 },
      'CG': { status: 'altered', desc: 'Altered melatonin receptor - avoid late eating', magnitude: 2 },
      'GC': { status: 'altered', desc: 'Altered melatonin receptor - avoid late eating', magnitude: 2 },
      'GG': { status: 'significantly_altered', desc: 'Significantly altered melatonin signaling', magnitude: 3 },
    }
  },

  // ==========================================================================
  // FITNESS
  // ==========================================================================
  
  'rs1815739': {
    gene: 'ACTN3',
    category: 'Fitness',
    variants: {
      'CC': { status: 'power', desc: 'Power/sprint athlete type - fast-twitch muscle fibers', magnitude: 1 },
      'CT': { status: 'mixed', desc: 'Mixed muscle fiber type - good all-around', magnitude: 0 },
      'TC': { status: 'mixed', desc: 'Mixed muscle fiber type - good all-around', magnitude: 0 },
      'TT': { status: 'endurance', desc: 'Endurance athlete type - slow-twitch muscle fibers', magnitude: 1 },
    }
  },
  
  'rs4994': {
    gene: 'ADRB3',
    category: 'Fitness',
    variants: {
      'CC': { status: 'normal', desc: 'Normal fat metabolism during exercise', magnitude: 0 },
      'TT': { status: 'normal', desc: 'Normal fat metabolism during exercise', magnitude: 0 },
      'CT': { status: 'reduced', desc: 'Reduced fat mobilization - may need longer cardio', magnitude: 1 },
      'TC': { status: 'reduced', desc: 'Reduced fat mobilization - may need longer cardio', magnitude: 1 },
    }
  },

  // ==========================================================================
  // INFLAMMATION
  // ==========================================================================
  
  'rs1800795': {
    gene: 'IL6',
    category: 'Inflammation',
    variants: {
      'GG': { status: 'normal', desc: 'Normal IL-6 production', magnitude: 0 },
      'GC': { status: 'elevated', desc: 'Elevated inflammatory response', magnitude: 2 },
      'CG': { status: 'elevated', desc: 'Elevated inflammatory response', magnitude: 2 },
      'CC': { status: 'high', desc: 'Higher IL-6 levels - anti-inflammatory diet helpful', magnitude: 3 },
    }
  },

  // ==========================================================================
  // SKIN
  // ==========================================================================
  
  'rs12913832': {
    gene: 'HERC2/OCA2',
    category: 'Skin',
    variants: {
      'AA': { status: 'brown', desc: 'Brown eye color likely', magnitude: 0 },
      'AG': { status: 'mixed', desc: 'Green/hazel eyes possible', magnitude: 0 },
      'GA': { status: 'mixed', desc: 'Green/hazel eyes possible', magnitude: 0 },
      'GG': { status: 'blue', desc: 'Blue eye color likely', magnitude: 0 },
    }
  },
  
  'rs1805007': {
    gene: 'MC1R',
    category: 'Skin',
    variants: {
      'CC': { status: 'normal', desc: 'Normal melanin production', magnitude: 0 },
      'CT': { status: 'red_carrier', desc: 'Red hair carrier - increased sun sensitivity', magnitude: 1 },
      'TC': { status: 'red_carrier', desc: 'Red hair carrier - increased sun sensitivity', magnitude: 1 },
      'TT': { status: 'red_hair', desc: 'Red hair variant - increased sun sensitivity, use SPF', magnitude: 2 },
    }
  },

  // ==========================================================================
  // ALCOHOL METABOLISM
  // ==========================================================================
  
  'rs1229984': {
    gene: 'ADH1B',
    category: 'Alcohol',
    variants: {
      'CC': { status: 'normal', desc: 'Normal alcohol metabolism', magnitude: 0 },
      'AA': { status: 'normal', desc: 'Normal alcohol metabolism', magnitude: 0 },
      'CT': { status: 'fast', desc: 'Fast alcohol metabolism - less pleasant effects', magnitude: 1 },
      'TC': { status: 'fast', desc: 'Fast alcohol metabolism - less pleasant effects', magnitude: 1 },
      'AG': { status: 'fast', desc: 'Fast alcohol metabolism - less pleasant effects', magnitude: 1 },
      'GA': { status: 'fast', desc: 'Fast alcohol metabolism - less pleasant effects', magnitude: 1 },
      'TT': { status: 'very_fast', desc: 'Very fast alcohol metabolism', magnitude: 2 },
      'GG': { status: 'very_fast', desc: 'Very fast alcohol metabolism', magnitude: 2 },
    }
  },
  
  'rs671': {
    gene: 'ALDH2',
    category: 'Alcohol',
    variants: {
      'GG': { status: 'normal', desc: 'Normal aldehyde dehydrogenase', magnitude: 0 },
      'GA': { status: 'reduced', desc: 'Asian flush - reduced alcohol tolerance', magnitude: 2 },
      'AG': { status: 'reduced', desc: 'Asian flush - reduced alcohol tolerance', magnitude: 2 },
      'AA': { status: 'deficient', desc: 'ALDH2 deficient - severe alcohol intolerance', magnitude: 3 },
    }
  },

  // ==========================================================================
  // LONGEVITY
  // ==========================================================================
  
  'rs2802292': {
    gene: 'FOXO3',
    category: 'Longevity',
    variants: {
      'TT': { status: 'normal', desc: 'Normal longevity genes', magnitude: 0 },
      'TG': { status: 'favorable', desc: 'Favorable longevity variant - associated with longer life', magnitude: 1 },
      'GT': { status: 'favorable', desc: 'Favorable longevity variant - associated with longer life', magnitude: 1 },
      'GG': { status: 'very_favorable', desc: 'Very favorable longevity variant', magnitude: 2 },
    }
  },
};

export function lookupSNP(rsid: string, genotype: string): SNPEntry['variants'][string] | null {
  const entry = SNP_DATABASE[rsid.toLowerCase()];
  if (!entry) return null;
  
  // Try exact match first
  if (entry.variants[genotype]) {
    return entry.variants[genotype];
  }
  
  // Try reversed genotype (AB vs BA)
  const reversed = genotype.split('').reverse().join('');
  if (entry.variants[reversed]) {
    return entry.variants[reversed];
  }
  
  return null;
}

export function getSNPInfo(rsid: string): SNPEntry | null {
  return SNP_DATABASE[rsid.toLowerCase()] || null;
}

export function getAllSNPs(): string[] {
  return Object.keys(SNP_DATABASE);
}
