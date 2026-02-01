<script lang="ts">
  import { selectedCategory, filteredFindings, categories, type AnalysisResults, type Category } from '$lib/stores/app';
  
  export let results: AnalysisResults;
  
  function getImpactStyle(impact: string): string {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'moderate': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-gray-400 dark:text-gray-600';
    }
  }
  
  function getImpactLabel(impact: string): string {
    switch (impact) {
      case 'high': return '●';
      case 'moderate': return '●';
      case 'low': return '○';
      default: return '○';
    }
  }
  
  function selectCategory(cat: Category) {
    selectedCategory.set(cat);
  }
</script>

<div class="space-y-6">
  <!-- Stats -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div class="p-3 bg-gray-50 dark:bg-gray-950 rounded-lg text-center">
      <div class="text-xl font-semibold">{results.snpsAnalyzed.toLocaleString()}</div>
      <div class="text-xs text-gray-500">analyzed</div>
    </div>
    <div class="p-3 bg-gray-50 dark:bg-gray-950 rounded-lg text-center">
      <div class="text-xl font-semibold">{results.findings.length}</div>
      <div class="text-xs text-gray-500">findings</div>
    </div>
    <div class="p-3 bg-gray-50 dark:bg-gray-950 rounded-lg text-center">
      <div class="text-xl font-semibold">{results.drugInteractions.length}</div>
      <div class="text-xs text-gray-500">drug alerts</div>
    </div>
    <div class="p-3 bg-gray-50 dark:bg-gray-950 rounded-lg text-center">
      <div class="text-xl font-semibold">{results.diseaseRisks.length}</div>
      <div class="text-xs text-gray-500">risks</div>
    </div>
  </div>
  
  <!-- Categories -->
  <div class="flex flex-wrap gap-1">
    {#each categories as cat}
      <button
        class="px-2 py-1 text-xs rounded transition-colors
               {$selectedCategory === cat 
                 ? 'bg-black dark:bg-white text-white dark:text-black' 
                 : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}"
        on:click={() => selectCategory(cat)}
      >
        {cat === 'all' ? 'All' : cat}
      </button>
    {/each}
  </div>
  
  <!-- Findings -->
  <div class="divide-y divide-gray-100 dark:divide-gray-900">
    {#each $filteredFindings as finding}
      <div class="py-3">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="font-medium text-sm">{finding.gene}</span>
              <span class="text-xs text-gray-400">{finding.rsid}</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{finding.description}</p>
            <div class="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <span class="font-mono">{finding.genotype}</span>
              <span>·</span>
              <span>{finding.category}</span>
            </div>
          </div>
          <span class="text-sm {getImpactStyle(finding.impact)}" title="{finding.impact} impact">
            {getImpactLabel(finding.impact)}
          </span>
        </div>
      </div>
    {/each}
    
    {#if $filteredFindings.length === 0}
      <div class="py-8 text-center text-sm text-gray-400">
        No findings in this category
      </div>
    {/if}
  </div>
  
  <!-- Drug Interactions -->
  {#if results.drugInteractions.length > 0}
    <div class="pt-4 border-t border-gray-100 dark:border-gray-900">
      <h3 class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Drug Interactions</h3>
      <div class="space-y-2">
        {#each results.drugInteractions as interaction}
          <div class="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-sm">{interaction.gene}</span>
              <span class="text-xs text-purple-600 dark:text-purple-400">Level {interaction.level}</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">{interaction.recommendation}</p>
            <p class="text-xs text-gray-400 mt-1">{interaction.drugs.join(' · ')}</p>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Disease Risks -->
  {#if results.diseaseRisks.length > 0}
    <div class="pt-4 border-t border-gray-100 dark:border-gray-900">
      <h3 class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Disease Markers</h3>
      <div class="space-y-2">
        {#each results.diseaseRisks as risk}
          <div class="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-sm">{risk.condition}</span>
              <span class="text-xs text-amber-600 dark:text-amber-400">{risk.significance}</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">{risk.interpretation}</p>
            <p class="text-xs text-gray-400 mt-1 font-mono">{risk.gene} · {risk.rsid}</p>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
