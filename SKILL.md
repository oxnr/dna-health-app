# SKILL.md - whatsmydna for AI Agents

**Comprehensive DNA analysis using external databases. Full genetic insights for your human.**

## Quick Start

```bash
# Clone
git clone https://github.com/oxnr/whatsmydna.git
cd whatsmydna

# Analyze a genome file
python3 analyze.py /path/to/genome.txt --output report.md
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Agent Workflow                             │
│                                                                 │
│  1. Human provides DNA file (23andMe, AncestryDNA, etc.)       │
│  2. Parse locally → extract rsIDs + genotypes                  │
│  3. Query databases:                                           │
│     ├── MyVariant.info (clinical, population freq)             │
│     ├── Ensembl (gene function, consequences)                  │
│     ├── GWAS Catalog (trait associations)                      │
│     └── ClinVar (pathogenic variants)                          │
│  4. Claude interprets combined data                            │
│  5. Generate personalized report                               │
└─────────────────────────────────────────────────────────────────┘
```

## Database APIs

### MyVariant.info (Primary - Aggregated Data)
```bash
# Lookup single variant
curl "https://myvariant.info/v1/variant/rs1801133?fields=clinvar,gnomad,dbnsfp"

# Batch query (up to 1000)
curl -X POST "https://myvariant.info/v1/variant" \
  -d 'ids=rs1801133,rs4244285,rs4680&fields=clinvar,gnomad'
```

### Ensembl (Variant Consequences)
```bash
curl "https://rest.ensembl.org/variation/human/rs1801133?content-type=application/json"
```

### GWAS Catalog (Trait Associations)
```bash
curl "https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/rs1801133"
```

## Agent Workflow (Detailed)

### Step 1: Parse Genome File
```python
def parse_genome(file_path: str) -> dict[str, str]:
    """Parse 23andMe/AncestryDNA format, return {rsid: genotype}"""
    snps = {}
    with open(file_path) as f:
        for line in f:
            if line.startswith('#') or not line.strip():
                continue
            parts = line.strip().split('\t')
            if len(parts) >= 4:
                rsid, chrom, pos, genotype = parts[:4]
                if genotype != '--':
                    snps[rsid.lower()] = genotype
    return snps
```

### Step 2: Query Databases (Batch)
```python
import requests

def query_myvariant(rsids: list[str]) -> dict:
    """Query MyVariant.info for batch of rsIDs"""
    url = "https://myvariant.info/v1/variant"
    # Batch in chunks of 1000
    results = {}
    for i in range(0, len(rsids), 1000):
        chunk = rsids[i:i+1000]
        resp = requests.post(url, data={
            'ids': ','.join(chunk),
            'fields': 'clinvar,gnomad,dbnsfp,cadd'
        })
        for item in resp.json():
            if '_id' in item:
                results[item['_id']] = item
    return results
```

### Step 3: Identify Significant Variants
```python
def filter_significant(variants: dict, genome: dict) -> list:
    """Find variants with clinical significance"""
    significant = []
    for rsid, data in variants.items():
        genotype = genome.get(rsid, '')
        
        # Check ClinVar significance
        clinvar = data.get('clinvar', {})
        if clinvar.get('clinical_significance') in ['Pathogenic', 'Likely_pathogenic']:
            significant.append({
                'rsid': rsid,
                'genotype': genotype,
                'significance': clinvar.get('clinical_significance'),
                'condition': clinvar.get('conditions', []),
                'gene': clinvar.get('gene', {}).get('symbol')
            })
    return significant
```

### Step 4: Generate Report with Claude
```python
def generate_report(significant: list, genome_stats: dict) -> str:
    """Use Claude to interpret findings"""
    prompt = f"""
    Analyze these genetic findings for a health report:
    
    Genome Stats:
    - Total SNPs: {genome_stats['total']}
    - Analyzed: {genome_stats['analyzed']}
    
    Significant Findings:
    {json.dumps(significant, indent=2)}
    
    Generate a comprehensive health report including:
    1. Summary of key findings
    2. Drug metabolism implications
    3. Health risk factors
    4. Actionable recommendations
    5. What to discuss with a doctor
    
    Use clear language. Include disclaimers about genetic testing limitations.
    """
    # Call Claude API
    return claude_response
```

## Analysis Categories

| Category | Key Genes | Databases |
|----------|-----------|-----------|
| Drug Metabolism | CYP2C19, CYP2D6, VKORC1 | PharmGKB, MyVariant |
| Disease Risk | BRCA1/2, APOE, CFTR | ClinVar, gnomAD |
| Carrier Status | HBB, CFTR, SMN1 | ClinVar |
| Traits | MTHFR, COMT, FTO | GWAS Catalog |
| Ancestry | Haplogroup markers | Ensembl |

## Rate Limits

| API | Limit | Notes |
|-----|-------|-------|
| MyVariant.info | 1000/hour | Batch requests |
| Ensembl | 15/sec | Use POST for batches |
| GWAS Catalog | Generous | No hard limit |
| NCBI/ClinVar | 3/sec | Get API key for 10/sec |

## Privacy Modes

### Mode 1: Full Privacy (Local Only)
- Use bundled ClinVar/PharmGKB databases
- No API calls
- Limited to ~350K known variants

### Mode 2: Hybrid (Recommended)
- Send only rsIDs to APIs (no genotypes)
- Match results with local genotypes
- APIs see "looking up rs123" not "has AG at rs123"

### Mode 3: Full Analysis
- Send rsID + genotype for maximum insights
- Required for some population frequency comparisons
- Most comprehensive results

## CLI Tool

```bash
# Full analysis with API queries
python3 analyze.py genome.txt --mode full --output report.md

# Local only (no API calls)
python3 analyze.py genome.txt --mode local --output report.md

# Specific categories
python3 analyze.py genome.txt --categories drug,disease,carrier

# JSON output for programmatic use
python3 analyze.py genome.txt --format json
```

## Output Schema (JSON)

```typescript
interface AnalysisResult {
  meta: {
    file: string;
    snps_total: number;
    snps_analyzed: number;
    timestamp: string;
    mode: 'local' | 'hybrid' | 'full';
  };
  findings: {
    pathogenic: Variant[];
    likely_pathogenic: Variant[];
    carrier: Variant[];
    drug_metabolism: DrugVariant[];
    traits: TraitVariant[];
  };
  summary: {
    high_priority: string[];
    recommendations: string[];
    discuss_with_doctor: string[];
  };
}
```

## Integration with OpenClaw

```yaml
# When human shares DNA file:
1. Save to /tmp/genome-{uuid}.txt
2. Parse and validate format
3. Run: python3 analyze.py /tmp/genome-*.txt --format json
4. Parse JSON, summarize for human
5. Offer deep-dives on specific findings
6. Generate PDF report if requested
7. Delete genome file after analysis
```

## Disclaimers (Always Include)

```
⚠️ This analysis is for educational purposes only.
- Not a medical diagnosis
- Not a substitute for genetic counseling
- Consult healthcare professionals before making health decisions
- Genetic variants indicate predispositions, not certainties
```

---

**Web UI:** [whatsmydna.xyz](https://whatsmydna.xyz)
**Built with:** [OpenClaw](https://github.com/openclaw/openclaw) + [Claude](https://anthropic.com/claude)
