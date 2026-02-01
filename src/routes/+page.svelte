<script lang="ts">
  import { onMount } from 'svelte';
  import { theme, lang, analysisState } from '$lib/stores/app';
  import { languages, t, type Language } from '$lib/i18n/translations';
  import { analyzeGenomeComprehensive } from '$lib/analysis/comprehensiveAnalyzer';
  import { MAX_FILE_SIZE_BYTES } from '$lib/analysis/parser';
  import DropZone from '$lib/components/DropZone.svelte';
  import Results from '$lib/components/Results.svelte';
  import ExportButtons from '$lib/components/ExportButtons.svelte';
  import ProcessingAnimation from '$lib/components/ProcessingAnimation.svelte';
  
  let showLangMenu = false;
  let progressMessage = '';
  let progressPercent = 0;
  let showDestroyConfirm = false;
  const languageEntries = Object.entries(languages) as [Language, (typeof languages)[Language]][];
  
  onMount(() => {
    theme.init();
    lang.init();
    
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
      progressMessage = 'Reading file...';
      
      if (file.size === 0) {
        throw new Error('File is empty. Please choose a valid DNA data file.');
      }
      
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum allowed: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`);
      }
      
      const content = await file.text();
      if (content.trim().length === 0) {
        throw new Error('File appears to be empty or unreadable.');
      }
      
      const results = await analyzeGenomeComprehensive(content, (progress) => {
        progressMessage = progress.message;
        progressPercent = progress.progress;
        analysisState.set({ status: 'analyzing', progress: progress.progress });
      });
      
      analysisState.set({ status: 'complete', results });
      
    } catch (error) {
      console.error('Analysis error:', error);
      analysisState.set({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Invalid file format'
      });
    }
  }
  
  function resetAnalysis() {
    analysisState.set({ status: 'idle' });
  }
  
  function destroyData() {
    analysisState.set({ status: 'idle' });
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
    showDestroyConfirm = false;
  }
  
  function toggleTheme() {
    theme.toggle();
  }
  
  $: currentLang = $lang;
</script>

<svelte:head>
  <title>whatsmydna - Private DNA Analysis</title>
  <meta name="description" content="Privacy-first genetic analysis. Your DNA never leaves your browser.">
</svelte:head>

<svelte:window on:keydown={(e) => showDestroyConfirm && e.key === 'Escape' && (showDestroyConfirm = false)} />

<div class="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100">
  <!-- Minimal Header -->
  <header class="border-b border-gray-100 dark:border-gray-900">
    <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 hover:opacity-70 transition-opacity">
        <span class="text-lg">🧬</span>
        <span class="font-medium tracking-tight">whatsmydna</span>
      </a>
      
      <div class="flex items-center gap-3">
        <!-- Privacy indicator -->
        <div class="hidden sm:flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          <span>Local only</span>
        </div>
        
        <!-- Language -->
        <div class="relative">
          <button
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors"
            on:click={() => showLangMenu = !showLangMenu}
            aria-label="Select language"
            aria-expanded={showLangMenu}
          >
            <span class="text-sm">{languages[currentLang].flag}</span>
          </button>
          
          {#if showLangMenu}
            <div class="absolute right-0 mt-1 w-40 max-h-64 overflow-y-auto bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded shadow-lg py-1 z-50">
              {#each languageEntries as [code, info]}
                <button
                  class="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-2
                         {code === currentLang ? 'bg-gray-50 dark:bg-gray-900' : ''}"
                  on:click={() => { lang.set(code); showLangMenu = false; }}
                >
                  <span>{info.flag}</span>
                  <span class="text-gray-600 dark:text-gray-400">{info.name}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
        
        <!-- Theme -->
        <button
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors"
          on:click={toggleTheme}
          aria-label={$theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          <span class="text-sm">{$theme === 'dark' ? '☀' : '☾'}</span>
        </button>
      </div>
    </div>
  </header>
  
  <!-- Main -->
  <main class="flex-1 flex flex-col">
    <div class="max-w-3xl mx-auto w-full px-4 py-8 md:py-12 flex-1">
      
      {#if $analysisState.status === 'idle'}
        <!-- Hero -->
        <div class="text-center mb-10">
          <h1 class="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
            Private DNA Analysis
          </h1>
          <p class="text-gray-500 dark:text-gray-500 text-sm">
            Your genetic data never leaves your browser
          </p>
        </div>
        
        <!-- Drop Zone -->
        <DropZone on:file={handleFile} />
        
        <!-- Privacy Badge -->
        <div class="mt-8 flex justify-center">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-full text-xs">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span>100% client-side · No uploads · No tracking</span>
          </div>
        </div>
        
        <!-- How it works -->
        <div class="mt-12 p-6 border border-gray-100 dark:border-gray-900 rounded-lg">
          <div class="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">How it works</div>
          <div class="grid grid-cols-4 gap-4 text-center text-xs">
            <div>
              <div class="text-lg mb-1">📄</div>
              <div class="text-gray-600 dark:text-gray-400">Drop file</div>
            </div>
            <div>
              <div class="text-lg mb-1">⚡</div>
              <div class="text-gray-600 dark:text-gray-400">Parse locally</div>
            </div>
            <div>
              <div class="text-lg mb-1">🔬</div>
              <div class="text-gray-600 dark:text-gray-400">Analyze</div>
            </div>
            <div>
              <div class="text-lg mb-1">🔒</div>
              <div class="text-gray-600 dark:text-gray-400">Results stay local</div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-900 text-xs text-gray-400 dark:text-gray-600 text-center">
            No server. No API calls. Everything runs in your browser tab.
          </div>
        </div>
        
        <!-- Supported formats -->
        <div class="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
          23andMe · AncestryDNA · MyHeritage · Nebula · FamilyTreeDNA · VCF
        </div>
        
      {:else if $analysisState.status === 'loading-db' || $analysisState.status === 'analyzing'}
        <ProcessingAnimation progress={progressPercent} message={progressMessage} />
        
      {:else if $analysisState.status === 'complete'}
        <!-- Results Header -->
        <div class="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold">Analysis Results</h2>
            <p class="text-xs text-gray-500 dark:text-gray-500">Data stored in browser memory only</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <ExportButtons results={$analysisState.results} />
            <button class="px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors" on:click={resetAnalysis}>
              New
            </button>
            <button 
              class="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
              on:click={() => showDestroyConfirm = true}
            >
              Destroy
            </button>
          </div>
        </div>
        
        <Results results={$analysisState.results} />
        
        <!-- Destroy Modal -->
        {#if showDestroyConfirm}
          <div class="fixed inset-0 z-50 p-4 flex items-center justify-center">
            <button
              type="button"
              class="absolute inset-0 bg-black/50"
              aria-label="Close dialog"
              on:click={() => showDestroyConfirm = false}
            ></button>
            <div 
              class="relative bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-5 max-w-xs w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="destroy-title"
            >
              <h3 id="destroy-title" class="font-medium mb-2">Destroy data?</h3>
              <p class="text-xs text-gray-500 dark:text-gray-500 mb-4">
                Clears all results from memory. Cannot be undone.
              </p>
              <div class="flex gap-2">
                <button 
                  class="flex-1 px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors"
                  on:click={() => showDestroyConfirm = false}
                >
                  Cancel
                </button>
                <button 
                  class="flex-1 px-3 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                  on:click={destroyData}
                >
                  Destroy
                </button>
              </div>
            </div>
          </div>
        {/if}
        
      {:else if $analysisState.status === 'error'}
        <div class="text-center py-16">
          <div class="text-3xl mb-4">⚠️</div>
          <p class="text-red-600 dark:text-red-400 mb-4 text-sm">{$analysisState.message}</p>
          <button 
            class="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded hover:opacity-80 transition-opacity" 
            on:click={resetAnalysis}
          >
            Try again
          </button>
        </div>
      {/if}
      
    </div>
  </main>
  
  <!-- Footer -->
  <footer class="border-t border-gray-100 dark:border-gray-900 py-4">
    <div class="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 dark:text-gray-600">
      <div>Not medical advice. For educational purposes only.</div>
      <div class="flex items-center gap-3">
        <a href="https://github.com/oxnr/whatsmydna" class="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">GitHub</a>
        <span>·</span>
        <span>Built with OpenClaw</span>
      </div>
    </div>
  </footer>
</div>

<!-- Click outside to close menus -->
{#if showLangMenu}
  <div 
    class="fixed inset-0 z-40" 
    on:click={() => showLangMenu = false}
    on:keypress={() => {}}
    role="button"
    tabindex="-1"
  ></div>
{/if}
