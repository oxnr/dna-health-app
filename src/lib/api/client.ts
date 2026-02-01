/**
 * API Client for Genetic Databases
 * Handles MyVariant.info, Ensembl, and GWAS Catalog queries
 */

export interface FetchOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_OPTIONS: FetchOptions = {
  timeout: 30000,
  retries: 2,
  retryDelay: 1000,
};

/**
 * Fetch with timeout and retry support
 */
async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout, retries, retryDelay } = { ...DEFAULT_OPTIONS, ...options };
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries!; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok && attempt < retries!) {
        lastError = new Error(`HTTP ${response.status}`);
        await new Promise(r => setTimeout(r, retryDelay! * (attempt + 1)));
        continue;
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;
      
      if (attempt < retries!) {
        await new Promise(r => setTimeout(r, retryDelay! * (attempt + 1)));
      }
    }
  }
  
  throw lastError || new Error('Request failed');
}

// =============================================================================
// MyVariant.info API
// =============================================================================

export interface MyVariantResult {
  _id: string;
  clinvar?: {
    clinical_significance?: string;
    conditions?: string[];
    gene?: { symbol: string };
    review_status?: string;
  };
  gnomad?: {
    af?: number;
    af_popmax?: number;
  };
  dbnsfp?: {
    polyphen2?: { hdiv?: { pred: string } };
    sift?: { pred: string };
    cadd?: { phred: number };
  };
}

export interface MyVariantBatchResult {
  results: MyVariantResult[];
  errors: string[];
}

/**
 * Query MyVariant.info for variant annotations
 * Aggregates ClinVar, gnomAD, dbNSFP data
 */
export async function queryMyVariant(
  rsids: string[],
  fields: string[] = ['clinvar', 'gnomad', 'dbnsfp.polyphen2', 'dbnsfp.sift', 'dbnsfp.cadd']
): Promise<MyVariantBatchResult> {
  const results: MyVariantResult[] = [];
  const errors: string[] = [];
  
  // Batch in chunks of 1000 (API limit)
  const BATCH_SIZE = 1000;
  
  for (let i = 0; i < rsids.length; i += BATCH_SIZE) {
    const chunk = rsids.slice(i, i + BATCH_SIZE);
    
    try {
      const response = await fetchWithRetry(
        'https://myvariant.info/v1/variant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            ids: chunk.join(','),
            fields: fields.join(','),
          }),
        }
      );
      
      const data = await response.json();
      
      // Handle both single result and array
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item._id && !item.notfound) {
          results.push(item);
        }
      }
    } catch (error) {
      errors.push(`MyVariant batch ${i}-${i + chunk.length}: ${error}`);
    }
  }
  
  return { results, errors };
}

// =============================================================================
// Ensembl API
// =============================================================================

export interface EnsemblVariant {
  name: string;
  source: string;
  mappings: Array<{
    allele_string: string;
    location: string;
    assembly_name: string;
  }>;
  most_severe_consequence?: string;
  clinical_significance?: string[];
}

/**
 * Query Ensembl for variant consequences
 */
export async function queryEnsembl(rsid: string): Promise<EnsemblVariant | null> {
  try {
    const response = await fetchWithRetry(
      `https://rest.ensembl.org/variation/human/${rsid}?content-type=application/json`
    );
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Batch query Ensembl (POST endpoint)
 */
export async function queryEnsemblBatch(
  rsids: string[]
): Promise<Record<string, EnsemblVariant>> {
  const results: Record<string, EnsemblVariant> = {};
  
  // Ensembl batch limit is 200
  const BATCH_SIZE = 200;
  
  for (let i = 0; i < rsids.length; i += BATCH_SIZE) {
    const chunk = rsids.slice(i, i + BATCH_SIZE);
    
    try {
      const response = await fetchWithRetry(
        'https://rest.ensembl.org/variation/human',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: chunk }),
        }
      );
      
      const data = await response.json();
      Object.assign(results, data);
    } catch {
      // Continue with other batches
    }
  }
  
  return results;
}

// =============================================================================
// GWAS Catalog API
// =============================================================================

export interface GWASAssociation {
  riskFrequency: string;
  pvalue: number;
  trait: string;
  study: string;
  pubmedId: string;
}

export interface GWASResult {
  rsid: string;
  associations: GWASAssociation[];
}

/**
 * Query GWAS Catalog for trait associations
 */
export async function queryGWAS(rsid: string): Promise<GWASResult | null> {
  try {
    const response = await fetchWithRetry(
      `https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/${rsid}/associations`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const associations: GWASAssociation[] = [];
    
    if (data._embedded?.associations) {
      for (const assoc of data._embedded.associations) {
        associations.push({
          riskFrequency: assoc.riskFrequency || 'unknown',
          pvalue: assoc.pvalue || 0,
          trait: assoc.efoTraits?.[0]?.trait || 'Unknown trait',
          study: assoc.study?.publicationInfo?.title || 'Unknown study',
          pubmedId: assoc.study?.publicationInfo?.pubmedId || '',
        });
      }
    }
    
    return { rsid, associations };
  } catch {
    return null;
  }
}

// =============================================================================
// Combined Analysis
// =============================================================================

export interface CombinedVariantData {
  rsid: string;
  genotype?: string;
  myvariant?: MyVariantResult;
  ensembl?: EnsemblVariant;
  gwas?: GWASResult;
  errors: string[];
}

export interface AnalysisAPIResult {
  variants: CombinedVariantData[];
  sources: {
    myvariant: { success: boolean; count: number };
    ensembl: { success: boolean; count: number };
    gwas: { success: boolean; count: number };
  };
  errors: string[];
}

/**
 * Query all sources for a list of variants
 * Uses Promise.allSettled to handle partial failures gracefully
 */
export async function analyzeVariantsRemote(
  rsids: string[],
  genotypes?: Record<string, string>
): Promise<AnalysisAPIResult> {
  const errors: string[] = [];
  const sources = {
    myvariant: { success: false, count: 0 },
    ensembl: { success: false, count: 0 },
    gwas: { success: false, count: 0 },
  };
  
  // Query all sources in parallel
  const [myvariantResult, ensemblResult] = await Promise.allSettled([
    queryMyVariant(rsids),
    queryEnsemblBatch(rsids.slice(0, 500)), // Limit Ensembl to 500 for speed
  ]);
  
  // Process MyVariant results
  const myvariantMap = new Map<string, MyVariantResult>();
  if (myvariantResult.status === 'fulfilled') {
    sources.myvariant.success = true;
    sources.myvariant.count = myvariantResult.value.results.length;
    errors.push(...myvariantResult.value.errors);
    
    for (const result of myvariantResult.value.results) {
      myvariantMap.set(result._id.toLowerCase(), result);
    }
  } else {
    errors.push(`MyVariant failed: ${myvariantResult.reason}`);
  }
  
  // Process Ensembl results
  const ensemblMap = new Map<string, EnsemblVariant>();
  if (ensemblResult.status === 'fulfilled') {
    sources.ensembl.success = true;
    sources.ensembl.count = Object.keys(ensemblResult.value).length;
    
    for (const [rsid, data] of Object.entries(ensemblResult.value)) {
      ensemblMap.set(rsid.toLowerCase(), data);
    }
  } else {
    errors.push(`Ensembl failed: ${ensemblResult.reason}`);
  }
  
  // Combine results
  const variants: CombinedVariantData[] = rsids.map(rsid => ({
    rsid,
    genotype: genotypes?.[rsid.toLowerCase()],
    myvariant: myvariantMap.get(rsid.toLowerCase()),
    ensembl: ensemblMap.get(rsid.toLowerCase()),
    errors: [],
  }));
  
  return { variants, sources, errors };
}
