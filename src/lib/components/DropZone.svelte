<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
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
  class="relative border rounded-lg p-12 md:p-16 transition-all duration-150 cursor-pointer group
         {isDragging 
           ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-950' 
           : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'}"
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
    accept=".txt,.csv,.tsv,.vcf"
    class="hidden"
    on:change={handleFileSelect}
  />
  
  <div class="flex flex-col items-center text-center">
    <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
      <span class="text-xl">📄</span>
    </div>
    
    <p class="text-gray-900 dark:text-white font-medium mb-1">
      Drop your DNA file here
    </p>
    <p class="text-xs text-gray-400 dark:text-gray-600">
      or click to browse
    </p>
  </div>
</div>
