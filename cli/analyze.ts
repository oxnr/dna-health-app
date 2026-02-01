#!/usr/bin/env npx ts-node
/**
 * DNA Analysis CLI for AI Agents
 * 
 * Usage:
 *   npx ts-node cli/analyze.ts <genome.txt> [--json] [--category <cat>] [--min-magnitude <n>]
 * 
 * Examples:
 *   npx ts-node cli/analyze.ts ~/genome.txt --json
 *   npx ts-node cli/analyze.ts ~/genome.txt --category pharma --json
 *   npx ts-node cli/analyze.ts ~/genome.txt --min-magnitude 3
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Adjust path to work from cli/ directory
const srcPath = resolve(__dirname, '..');
process.chdir(srcPath);

async function main() {
  const args = process.argv.slice(2);
  
  // Parse flags
  const jsonOutput = args.includes('--json');
  const categoryIdx = args.indexOf('--category');
  const category = categoryIdx !== -1 ? args[categoryIdx + 1] : null;
  const magIdx = args.indexOf('--min-magnitude');
  const minMagnitude = magIdx !== -1 ? parseInt(args[magIdx + 1]) : 0;
  const helpFlag = args.includes('--help') || args.includes('-h');
  
  // Get file path (first non-flag argument)
  const filePath = args.find(a => !a.startsWith('--') && !['pharma', 'health', 'nutrition', 'sleep', 'fitness', 'cardio', 'mental', 'longevity'].includes(a) && !a.match(/^\d+$/));
  
  if (helpFlag || !filePath) {
    console.log(`
DNA Analysis CLI - Analyze genetic data for health insights

USAGE:
  npx ts-node cli/analyze.ts <genome-file> [options]

OPTIONS:
  --json              Output results as JSON (default: human-readable)
  --category <cat>    Filter by category (pharma, health, nutrition, etc.)
  --min-magnitude <n> Only show findings with magnitude >= n (0-6)
  --help, -h          Show this help

CATEGORIES:
  pharma     Drug metabolism & interactions
  health     General health markers
  nutrition  Diet & nutrient metabolism
  sleep      Sleep & circadian genes
  fitness    Athletic & muscle genes
  cardio     Cardiovascular markers
  mental     Neurotransmitters & mood
  longevity  Aging-related genes

EXAMPLES:
  npx ts-node cli/analyze.ts ~/23andme.txt --json
  npx ts-node cli/analyze.ts genome.txt --category pharma --json
  npx ts-node cli/analyze.ts genome.txt --min-magnitude 3

OUTPUT (JSON):
  {
    "success": true,
    "snpsAnalyzed": 42,
    "findings": [...],
    "drugInteractions": [...],
    "highImpact": [...],
    "summary": {...}
  }
`);
    process.exit(filePath ? 0 : 1);
  }

  // Resolve and validate file
  const resolvedPath = resolve(filePath);
  if (!existsSync(resolvedPath)) {
    const error = { success: false, error: `File not found: ${resolvedPath}` };
    if (jsonOutput) {
      console.log(JSON.stringify(error, null, 2));
    } else {
      console.error(`Error: ${error.error}`);
    }
    process.exit(1);
  }

  try {
    // Dynamic import to handle ESM modules
    const { analyzeGenome } = await import('../src/lib/analysis/analyzer');
    
    const content = readFileSync(resolvedPath, 'utf-8');
    const results = await analyzeGenome(content);

    // Filter by category if specified
    let findings = results.findings;
    if (category) {
      const categoryMap: Record<string, string[]> = {
        pharma: ['Drug Metabolism', 'Pharmacogenomics'],
        health: ['Health', 'Autoimmune', 'Respiratory'],
        nutrition: ['Nutrition', 'Iron Metabolism'],
        sleep: ['Sleep/Circadian', 'Sleep'],
        fitness: ['Fitness', 'Sports'],
        cardio: ['Cardiovascular'],
        mental: ['Neurotransmitters', 'Mental Health', 'Psychology', 'Cognitive'],
        longevity: ['Longevity', 'Aging'],
      };
      const cats = categoryMap[category.toLowerCase()] || [category];
      findings = findings.filter(f => 
        cats.some(c => f.category.toLowerCase().includes(c.toLowerCase()))
      );
    }

    // Filter by magnitude
    if (minMagnitude > 0) {
      findings = findings.filter(f => f.magnitude >= minMagnitude);
    }

    const highImpact = findings.filter(f => f.impact === 'high' || f.magnitude >= 3);
    
    // Build summary
    const summary = {
      totalFindings: findings.length,
      highImpact: highImpact.length,
      drugInteractions: results.drugInteractions.length,
      byCategory: {} as Record<string, number>,
      byImpact: {
        high: findings.filter(f => f.impact === 'high').length,
        moderate: findings.filter(f => f.impact === 'moderate').length,
        low: findings.filter(f => f.impact === 'low').length,
        info: findings.filter(f => f.impact === 'info').length,
      }
    };

    for (const f of findings) {
      summary.byCategory[f.category] = (summary.byCategory[f.category] || 0) + 1;
    }

    if (jsonOutput) {
      console.log(JSON.stringify({
        success: true,
        file: resolvedPath,
        snpsAnalyzed: results.snpsAnalyzed,
        snpsTotal: results.snpsTotal,
        findings,
        drugInteractions: results.drugInteractions,
        diseaseRisks: results.diseaseRisks,
        highImpact,
        summary,
        timestamp: new Date().toISOString()
      }, null, 2));
    } else {
      // Human-readable output
      console.log('\n🧬 DNA ANALYSIS RESULTS\n');
      console.log(`File: ${resolvedPath}`);
      console.log(`SNPs analyzed: ${results.snpsAnalyzed} / ${results.snpsTotal}`);
      console.log(`Total findings: ${findings.length}`);
      console.log('');

      if (highImpact.length > 0) {
        console.log('⚠️  HIGH IMPACT FINDINGS:\n');
        for (const f of highImpact) {
          console.log(`  • ${f.gene} (${f.rsid})`);
          console.log(`    ${f.description}`);
          console.log(`    Category: ${f.category} | Magnitude: ${f.magnitude}/6`);
          console.log('');
        }
      }

      if (results.drugInteractions.length > 0) {
        console.log('💊 DRUG INTERACTIONS:\n');
        for (const d of results.drugInteractions) {
          console.log(`  • ${d.gene}: ${d.drugs.join(', ')}`);
          console.log(`    ${d.recommendation}`);
          console.log('');
        }
      }

      console.log('📊 SUMMARY BY CATEGORY:\n');
      for (const [cat, count] of Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${cat}: ${count}`);
      }
      console.log('');
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (jsonOutput) {
      console.log(JSON.stringify({ success: false, error: errorMsg }, null, 2));
    } else {
      console.error(`Error: ${errorMsg}`);
    }
    process.exit(1);
  }
}

main();
