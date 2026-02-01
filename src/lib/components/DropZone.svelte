<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { lang } from '$lib/stores/app';
  import { t } from '$lib/i18n/translations';
  
  const dispatch = createEventDispatcher<{ file: File }>();
  
  let isDragging = false;
  let fileInput: HTMLInputElement;
  
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }
  
  function handleDragLeave() {
    isDragging = false;
  }
  
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      dispatch('file', files[0]);
    }
  }
  
  function handleClick() {
    fileInput?.click();
  }
  
  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      dispatch('file', input.files[0]);
    }
  }
</script>

<div
  class="relative border-2 border-dashed rounded-2xl p-12 md:p-16 transition-all duration-300 cursor-pointer
         {isDragging 
           ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
           : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50'}"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:click={handleClick}
  on:keypress={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
>
  <input
    bind:this={fileInput}
    type="file"
    accept=".txt,.csv,.tsv,.vcf,.zip"
    class="hidden"
    on:change={handleFileSelect}
  />
  
  <div class="flex flex-col items-center text-center space-y-4">
    <div class="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
      <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    </div>
    
    <div>
      <p class="text-lg font-medium text-gray-900 dark:text-white">
        {t($lang, 'dropzone_title')}
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {t($lang, 'dropzone_subtitle')}
      </p>
    </div>
    
    <p class="text-xs text-gray-400 dark:text-gray-500">
      {t($lang, 'dropzone_formats')}
    </p>
  </div>
</div>
