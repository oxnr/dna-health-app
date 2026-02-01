<script lang="ts">
  import { onMount } from 'svelte';
  import { theme, lang, analysisState, type AnalysisResults } from '$lib/stores/app';
  import { languages, t, type Language } from '$lib/i18n/translations';
  import { analyzeGenome } from '$lib/analysis/analyzer';
  import DropZone from '$lib/components/DropZone.svelte';
  import Results from '$lib/components/Results.svelte';
  import ExportButtons from '$lib/components/ExportButtons.svelte';
  
  let showLangMenu = false;
  let progressMessage = '';
  let progressPercent = 0;
  
  onMount(() => {
    theme.init();
    lang.init();
    
    // Watch theme changes
    theme.subscribe(t => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', t === 'dark');
        localStorage.setItem('theme', t);
      }
    });
  });
  
  async function handleFile(event: CustomEvent<File>) {
    const file = event.detail;
    
    try {
      analysisState.set({ status: 'loading-db', progress: 0 });
      progressMessage = t($lang, 'analyzing');
      
      // Read file
      const content = await file.text();
      
      // Run analysis
      const results = await analyzeGenome(content, (progress) => {
        progressMessage = progress.message;
        progressPercent = progress.progress;
        analysisState.set({ status: 'analyzing', progress: progress.progress });
      });
      
      analysisState.set({ status: 'complete', results });
      
    } catch (error) {
      console.error('Analysis error:', error);
      analysisState.set({ 
        status: 'error', 
        message: error instanceof Error ? error.message : t($lang, 'error_invalid_file')
      });
    }
  }
  
  function resetAnalysis() {
    analysisState.set({ status: 'idle' });
  }
  
  function toggleTheme() {
    theme.toggle();
  }
  
  function selectLanguage(langCode: Language) {
    lang.set(langCode);
    showLangMenu = false;
  }
  
  $: currentLang = $lang;
</script>

<svelte:head>
  <title>{t($lang, 'title')}</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🧬</span>
        <span class="font-semibold text-gray-900 dark:text-white hidden sm:inline">
          {t($lang, 'title')}
        </span>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Language Selector -->
        <div class="relative">
          <button
            class="btn btn-secondary text-sm flex items-center gap-1"
            on:click={() => showLangMenu = !showLangMenu}
          >
            <span>{languages[currentLang].flag}</span>
            <span class="hidden sm:inline">{languages[currentLang].name}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {#if showLangMenu}
            <div class="absolute right-0 mt-2 w-48 max-h-80 overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {#each Object.entries(languages) as [code, info]}
                <button
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-sm
                         {code === currentLang ? 'bg-blue-50 dark:bg-blue-900/30' : ''}"
                  on:click={() => { lang.set(code); showLangMenu = false; }}
                >
                  <span>{info.flag}</span>
                  <span class="text-gray-900 dark:text-white">{info.name}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
        
        <!-- Theme Toggle -->
        <button
          class="btn btn-secondary p-2"
          on:click={toggleTheme}
          title={$theme === 'dark' ? t($lang, 'light_mode') : t($lang, 'dark_mode')}
        >
          {#if $theme === 'dark'}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </header>
  
  <!-- Main Content -->
  <main class="flex-1">
    <div class="max-w-5xl mx-auto px-4 py-8 md:py-12">
      
      {#if $analysisState.status === 'idle'}
        <!-- Upload Section -->
        <div class="text-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t($lang, 'title')}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {t($lang, 'subtitle')}
          </p>
        </div>
        
        <DropZone on:file={handleFile} />
        
        <!-- Privacy Badges -->
        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
          <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{t($lang, 'privacy_badge')}</span>
          </div>
          <div class="text-gray-500 dark:text-gray-400">
            {t($lang, 'no_accounts')}
          </div>
        </div>
        
      {:else if $analysisState.status === 'loading-db' || $analysisState.status === 'analyzing'}
        <!-- Loading State -->
        <div class="text-center py-16">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p class="text-lg text-gray-700 dark:text-gray-300">{progressMessage}</p>
          <div class="w-64 mx-auto mt-4 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              class="h-full bg-blue-600 transition-all duration-300"
              style="width: {progressPercent}%"
            ></div>
          </div>
        </div>
        
      {:else if $analysisState.status === 'complete'}
        <!-- Results Section -->
        <div class="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {t($lang, 'results_title')}
          </h2>
          <div class="flex flex-wrap items-center gap-2">
            <ExportButtons results={$analysisState.results} />
            <button
              class="btn btn-primary"
              on:click={resetAnalysis}
            >
              {t($lang, 'new_analysis')}
            </button>
          </div>
        </div>
        
        <Results results={$analysisState.results} />
        
      {:else if $analysisState.status === 'error'}
        <!-- Error State -->
        <div class="text-center py-16">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-lg text-gray-700 dark:text-gray-300 mb-4">{$analysisState.message}</p>
          <button
            class="btn btn-primary"
            on:click={resetAnalysis}
          >
            {t($lang, 'new_analysis')}
          </button>
        </div>
      {/if}
      
    </div>
  </main>
  
  <!-- Footer -->
  <footer class="border-t border-gray-200 dark:border-gray-800 py-6">
    <div class="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>{t($lang, 'disclaimer')}</p>
    </div>
  </footer>
</div>

<!-- Click outside to close language menu -->
{#if showLangMenu}
  <div 
    class="fixed inset-0 z-40" 
    on:click={() => showLangMenu = false}
    on:keypress={() => {}}
    role="button"
    tabindex="-1"
  ></div>
{/if}
