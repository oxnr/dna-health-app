/**
 * API Endpoint: /api/analyze
 * Proxies requests to genetic databases to avoid CORS
 * 
 * POST { rsids: string[], mode: 'basic' | 'full' }
 * Returns aggregated results from MyVariant, Ensembl, GWAS
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const MYVARIANT_URL = 'https://myvariant.info/v1/variant';
const ENSEMBL_URL = 'https://rest.ensembl.org/variation/human';

interface AnalyzeRequest {
  rsids: string[];
  mode?: 'basic' | 'full';
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body: AnalyzeRequest = await request.json();
    const { rsids, mode = 'basic' } = body;

    if (!rsids || !Array.isArray(rsids) || rsids.length === 0) {
      return json({ error: 'rsids array required' }, { status: 400 });
    }

    // Limit batch size for safety
    const limitedRsids = rsids.slice(0, 5000);
    
    const results = {
      myvariant: null as any,
      ensembl: null as any,
      errors: [] as string[],
    };

    // Query MyVariant.info (primary source)
    try {
      const mvResponse = await fetch(MYVARIANT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          ids: limitedRsids.join(','),
          fields: 'clinvar,gnomad.af,dbnsfp.polyphen2,dbnsfp.sift,dbnsfp.cadd.phred',
        }),
      });
      
      if (mvResponse.ok) {
        results.myvariant = await mvResponse.json();
      } else {
        results.errors.push(`MyVariant: HTTP ${mvResponse.status}`);
      }
    } catch (e) {
      results.errors.push(`MyVariant: ${e}`);
    }

    // Query Ensembl for full mode (variant consequences)
    if (mode === 'full' && limitedRsids.length <= 200) {
      try {
        const ensResponse = await fetch(ENSEMBL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: limitedRsids }),
        });
        
        if (ensResponse.ok) {
          results.ensembl = await ensResponse.json();
        } else {
          results.errors.push(`Ensembl: HTTP ${ensResponse.status}`);
        }
      } catch (e) {
        results.errors.push(`Ensembl: ${e}`);
      }
    }

    return json(results);
  } catch (e) {
    return json({ error: `Server error: ${e}` }, { status: 500 });
  }
};
