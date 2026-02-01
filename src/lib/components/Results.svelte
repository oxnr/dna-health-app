<script lang="ts">
  import { lang, selectedCategory, filteredFindings, categories, type AnalysisResults, type Category } from '$lib/stores/app';
  import { t } from '$lib/i18n/translations';
  
  export let results: AnalysisResults;
  
  function getImpactColor(impact: string): string {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  }
  
  function getImpactLabel(impact: string): string {
    switch (impact) {
      case 'high': return t($lang, 'high_impact');
      case 'moderate': return t($lang, 'moderate_impact');
      case 'low': return t($lang, 'low_impact');
      default: return 'INFO';
    }
  }
  
  function getCategoryLabel(cat: Category): string {
    if (cat === 'all') return 'All';
    return t($lang, `category_${cat}`) || cat;
  }
  
  function selectCategory(cat: Category) {
    selectedCategory.set(cat);
  }
  
  $: highImpactCount = results.findings.filter(f => f.impact === 'high').length;
</script>

<div class="space-y-6">
  <!-- Stats Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="card p-4 text-center">
      <div class="text-3xl font-bold text-gray-900 dark:text-white">{results.snpsAnalyzed}</div>
      <div class="text-sm text-gray-500 dark:text-gray-400">{t($lang, 'snps_analyzed')}</div>
    </div>
    <div class="card p-4 text-center">
      <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{results.findings.length}</div>
      <div class="text-sm text-gray-500 dark:text-gray-400">{t($lang, 'health_findings')}</div>
    </div>
    <div class="card p-4 text-center">
      <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{results.drugInteractions.length}</div>
      <div class="text-sm text-gray-500 dark:text-gray-400">{t($lang, 'drug_interactions')}</div>
    </div>
    <div class="card p-4 text-center">
      <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">{results.diseaseRisks.length}</div>
      <div class="text-sm text-gray-500 dark:text-gray-400">{t($lang, 'disease_risk')}</div>
    </div>
  </div>
  
  <!-- Category Tabs -->
  <div class="flex flex-wrap gap-2">
    {#each categories as cat}
      <button
        class="px-3 py-1.5 text-sm rounded-full transition-colors
               {$selectedCategory === cat 
                 ? 'bg-blue-600 text-white' 
                 : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}"
        on:click={() => selectCategory(cat)}
      >
        {getCategoryLabel(cat)}
      </button>
    {/each}
  </div>
  
  <!-- Findings List -->
  <div class="space-y-3">
    {#each $filteredFindings as finding}
      <div class="card p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-gray-900 dark:text-white">{finding.gene}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">({finding.rsid})</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {finding.category}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{finding.description}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t($lang, 'your_genotype')}: <span class="font-mono font-medium">{finding.genotype}</span>
            </p>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded {getImpactColor(finding.impact)}">
            {getImpactLabel(finding.impact)}
          </span>
        </div>
      </div>
    {/each}
    
    {#if $filteredFindings.length === 0}
      <div class="text-center py-8 text-gray-500 dark:text-gray-400">
        No findings in this category
      </div>
    {/if}
  </div>
  
  <!-- Drug Interactions Section -->
  {#if results.drugInteractions.length > 0}
    <div class="mt-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        💊 {t($lang, 'drug_interactions')}
      </h3>
      <div class="space-y-3">
        {#each results.drugInteractions as interaction}
          <div class="card p-4 border-l-4 border-purple-500">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900 dark:text-white">{interaction.gene}</span>
              <span class="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                Level {interaction.level}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{interaction.recommendation}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Affected drugs: {interaction.drugs.join(', ')}
            </p>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Disease Risks Section -->
  {#if results.diseaseRisks.length > 0}
    <div class="mt-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        ⚠️ {t($lang, 'disease_risk')}
      </h3>
      <div class="space-y-3">
        {#each results.diseaseRisks as risk}
          <div class="card p-4 border-l-4 border-orange-500">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900 dark:text-white">{risk.condition}</span>
              <span class="text-xs px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                {risk.significance}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{risk.interpretation}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Gene: {risk.gene} ({risk.rsid})
            </p>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
