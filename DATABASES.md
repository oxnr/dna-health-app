# Genetic Databases for whatsmydna

## Currently Integrated (Local)

| Database | Variants | Source | Update |
|----------|----------|--------|--------|
| ClinVar | 341K | NCBI | Quarterly |
| PharmGKB | ~5K | PharmGKB | Quarterly |
| Custom SNP DB | ~200 | Curated | Manual |

## Available APIs (Free)

### 1. NCBI/dbSNP
- **URL:** `https://api.ncbi.nlm.nih.gov/variation/v0/`
- **Data:** 1B+ variants, frequencies, clinical significance
- **Rate Limit:** 3 req/sec without key, 10/sec with API key
- **Example:** `GET /refsnp/{rsid}`

### 2. Ensembl REST API
- **URL:** `https://rest.ensembl.org/`
- **Data:** Variant consequences, gene info, regulatory
- **Rate Limit:** 15 req/sec
- **Example:** `GET /variation/human/{rsid}?content-type=application/json`

### 3. ClinVar API (NCBI)
- **URL:** `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`
- **Data:** Clinical significance, disease associations
- **Rate Limit:** 3/sec without key
- **Example:** `esearch.fcgi?db=clinvar&term={rsid}`

### 4. gnomAD (Browser)
- **URL:** `https://gnomad.broadinstitute.org/api`
- **Data:** Population frequencies (140K exomes, 76K genomes)
- **Access:** GraphQL API
- **Note:** Best for allele frequency data

### 5. GWAS Catalog API
- **URL:** `https://www.ebi.ac.uk/gwas/rest/api/`
- **Data:** Trait associations from published studies
- **Rate Limit:** Generous
- **Example:** `GET /singleNucleotidePolymorphisms/{rsid}`

### 6. OpenSNP
- **URL:** `https://opensnp.org/api/`
- **Data:** User-contributed phenotypes, annotations
- **Rate Limit:** Fair use
- **Note:** Community-driven, less authoritative

### 7. MyVariant.info
- **URL:** `https://myvariant.info/v1/`
- **Data:** Aggregates ClinVar, dbSNP, gnomAD, etc.
- **Rate Limit:** 1000/hour
- **Example:** `GET /variant/{rsid}?fields=clinvar,gnomad`
- **⭐ RECOMMENDED:** Single API, multiple sources

### 8. LitVar (NCBI)
- **URL:** `https://www.ncbi.nlm.nih.gov/research/litvar2-api/`
- **Data:** Variant mentions in literature
- **Use:** Find research papers about specific variants

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     whatsmydna Frontend                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Analysis Pipeline                            │
│                                                                 │
│  1. Parse genome file (client-side)                            │
│  2. Extract rsIDs                                              │
│  3. Query APIs:                                                │
│     ├── MyVariant.info (aggregated data)                       │
│     ├── Ensembl (consequences)                                 │
│     └── GWAS Catalog (trait associations)                      │
│  4. Claude interprets findings                                  │
│  5. Generate personalized report                               │
└─────────────────────────────────────────────────────────────────┘
```

## Privacy Considerations

| Data Sent | To Where | Risk Level |
|-----------|----------|------------|
| rsIDs only | APIs | Low (no genotypes) |
| rsID + genotype | APIs | Medium |
| Full file | Backend | High |
| Nothing | - | None (local only) |

### Hybrid Approach (Recommended)
1. Parse file locally (client)
2. Send only rsIDs to APIs (no genotypes)
3. Match responses with local genotypes
4. Use Claude for interpretation (can see genotypes)

This way APIs never see your actual genetic data - just "does rs123 exist?" not "I have AG at rs123".

## API Integration Priority

1. **MyVariant.info** - Best bang for buck, aggregates everything
2. **Ensembl** - Variant consequences, gene function
3. **GWAS Catalog** - Trait associations
4. **gnomAD** - Population frequencies (via MyVariant)
5. **LitVar** - Research paper citations
