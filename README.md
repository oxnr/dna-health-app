# 🧬 What's My DNA

**Privacy-first DNA analysis that works for everyone.**

Upload your 23andMe, AncestryDNA, or other genetic testing file and get instant, human-readable health insights. All processing happens in your browser — your DNA never leaves your device.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://whatsmydna.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## ✨ Features

- **🔒 100% Private** — Analysis runs entirely in your browser. No uploads, no servers, no tracking.
- **🌍 Works for Everyone** — 85,000+ variants analyzed automatically with human-readable explanations.
- **💊 Actionable Recommendations** — Get personalized advice for food, supplements, and lifestyle.
- **📱 Mobile Friendly** — Works on any device with a modern browser.
- **🌙 Dark Mode** — Easy on the eyes.
- **🌐 Multi-language** — English, German, Turkish, and more.

## 🚀 Quick Start

1. Visit [whatsmydna.vercel.app](https://whatsmydna.vercel.app)
2. Drag & drop your DNA file (23andMe, AncestryDNA, etc.)
3. Get instant results!

Or run locally:

```bash
git clone https://github.com/oxnr/whatsmydna
cd whatsmydna
npm install
npm run dev
```

## 📊 What Gets Analyzed

### Layer 1: ClinVar Database (85,588 variants)
Automatic scanning for disease-associated variants with human-readable explanations:
- Cancer risk genes (BRCA1/2, TP53, APC, Lynch syndrome genes)
- Cardiovascular (LDLR, APOB, cardiomyopathy genes)
- Neurological (Alzheimer's, Parkinson's risk genes)
- Blood disorders (Factor V Leiden, hemoglobin variants)
- Metabolic conditions (cystic fibrosis, PKU, Gaucher's)

### Layer 2: PharmGKB (2,840 drug interactions)
FDA-level pharmacogenomic guidance:
- Warfarin dosing (CYP2C9, VKORC1)
- Statin safety (SLCO1B1)
- Antidepressant response (CYP2D6, CYP2C19)
- Chemotherapy dosing (DPYD, TPMT, NUDT15)
- Pain medication metabolism (CYP2D6)

### Layer 3: Curated SNPs (114 markers)
Premium explanations with actionable recommendations:

| Category | Examples |
|----------|----------|
| **Nutrition** | Lactose intolerance, caffeine metabolism, vitamin D needs, bitter taste |
| **Fitness** | Power vs endurance (ACTN3), injury risk, recovery |
| **Brain Health** | APOE (Alzheimer's), COMT (stress response), BDNF |
| **Methylation** | MTHFR, folate metabolism |
| **Cardiovascular** | Lp(a), cholesterol genes, clotting factors |
| **Longevity** | FOXO3, CETP, telomere-related genes |
| **Detox** | PON1 (pesticides), alcohol metabolism |
| **Drug Response** | Warfarin, statins, many more |

## 💡 Human-Friendly Recommendations

Each finding comes with actionable advice:

### Example: MTHFR C677T (TT genotype)

> **What it means:** Your body has trouble converting folic acid to its active form.
>
> **🥗 Food:** Eat folate-rich foods - leafy greens, legumes, avocado
> 
> **💊 Supplement:** Take methylfolate (5-MTHF) instead of folic acid
>
> **🚫 Avoid:** Skip fortified foods with synthetic folic acid
>
> **📋 Evidence:** Well-established

### Example: APOE ε4 carrier

> **What it means:** Increased Alzheimer's risk, but highly modifiable.
>
> **🏃 Lifestyle:** Exercise 30+ min daily (reduces risk by 50%+)
>
> **🥗 Food:** Mediterranean diet - olive oil, fish, vegetables
>
> **😴 Lifestyle:** Prioritize 7-8 hours sleep
>
> **💊 Supplement:** DHA omega-3 (1000mg+) supports brain health
>
> **📋 Evidence:** Well-established

## 🔬 Supported File Formats

| Service | Format | Status |
|---------|--------|--------|
| 23andMe | TXT | ✅ Full support |
| AncestryDNA | TXT | ✅ Full support |
| MyHeritage | CSV | ✅ Full support |
| FamilyTreeDNA | CSV | ✅ Full support |
| LivingDNA | TXT | ✅ Full support |
| Nebula Genomics | TXT | ✅ Full support |
| Dante Labs | TXT | ✅ Full support |
| Generic VCF | VCF | ✅ Full support |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 Your Browser                     │
│  ┌───────────────────────────────────────────┐  │
│  │           DNA File (never uploaded)        │  │
│  └───────────────────────────────────────────┘  │
│                      ↓                          │
│  ┌───────────────────────────────────────────┐  │
│  │              Parser (parser.ts)            │  │
│  │         Extracts SNPs from any format      │  │
│  └───────────────────────────────────────────┘  │
│                      ↓                          │
│  ┌───────────────────────────────────────────┐  │
│  │     Comprehensive Analyzer                 │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ ClinVar (85K)    → Auto-explained   │  │  │
│  │  │ PharmGKB (2.8K)  → Auto-explained   │  │  │
│  │  │ Curated (114)    → Premium quality  │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│                      ↓                          │
│  ┌───────────────────────────────────────────┐  │
│  │     Recommendations Engine                 │  │
│  │  Food | Supplements | Lifestyle | Medical  │  │
│  └───────────────────────────────────────────┘  │
│                      ↓                          │
│  ┌───────────────────────────────────────────┐  │
│  │         Results (100% client-side)         │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## 🛡️ Privacy Guarantee

- **No server uploads** — All analysis runs in WebAssembly/JavaScript in your browser
- **No tracking** — No analytics, no cookies, no fingerprinting  
- **No storage** — Click "Destroy Data" and everything is wiped from memory
- **Open source** — Audit the code yourself

## 📖 Data Sources

- [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) — NCBI clinical variant database
- [PharmGKB](https://www.pharmgkb.org/) — Pharmacogenomics knowledge base
- [CPIC](https://cpicpgx.org/) — Clinical pharmacogenetics guidelines
- [SNPedia](https://www.snpedia.com/) — Community SNP wiki

## 🤝 Contributing

Contributions welcome! Here's how:

### Add curated SNP explanations
Edit `src/lib/analysis/comprehensiveSnpDatabase.ts`:
```typescript
"rs123456": {
  gene: "GENE_NAME",
  category: "Category",
  variants: {
    "AA": { status: "normal", desc: "Human-readable explanation", magnitude: 0 },
    "AG": { status: "carrier", desc: "What this means for you", magnitude: 2 },
    "GG": { status: "affected", desc: "Actionable advice here", magnitude: 3 },
  }
}
```

### Add recommendations
Edit `src/lib/analysis/recommendations.ts`:
```typescript
"rs123456": {
  "GG": [
    { category: 'food', title: 'Eat more X', description: 'Because...', priority: 'high', evidence: 'Well-established' },
    { category: 'supplement', title: 'Consider Y', description: 'May help...', priority: 'medium', evidence: 'Emerging' },
  ]
}
```

### Improve auto-explanations
Edit `src/lib/analysis/autoExplainer.ts` to add gene functions or drug class explanations.

## ⚠️ Disclaimer

**This tool is for educational purposes only.** It is not a medical diagnostic device and should not be used to make health decisions. Always consult healthcare professionals for medical advice. Genetic testing results require proper interpretation by qualified geneticists or genetic counselors.

## 📄 License

MIT License — use freely, but please contribute improvements back!

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- UI components from [shadcn-svelte](https://www.shadcn-svelte.com/)
- Hosted on [Vercel](https://vercel.com)
- Curated with help from AI (Claude Code + Codex)

---

**Made with 🧬 by [oxnr](https://github.com/oxnr)**
