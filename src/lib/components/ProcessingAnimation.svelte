<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  export let progress: number = 0;
  export let message: string = 'Processing...';
  
  const privacyMessages = [
    'Processing in your browser',
    'No data leaving this tab',
    'Analyzing locally',
    'Your DNA stays private',
    '100% client-side',
  ];
  
  let currentMessageIndex = 0;
  let interval: ReturnType<typeof setInterval>;
  
  onMount(() => {
    interval = setInterval(() => {
      currentMessageIndex = (currentMessageIndex + 1) % privacyMessages.length;
    }, 2000);
  });
  
  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="flex flex-col items-center justify-center py-16">
  <!-- Simple spinner -->
  <div class="relative w-16 h-16 mb-6">
    <div class="absolute inset-0 border-2 border-gray-200 dark:border-gray-800 rounded-full"></div>
    <div 
      class="absolute inset-0 border-2 border-transparent border-t-black dark:border-t-white rounded-full animate-spin"
    ></div>
    <div class="absolute inset-0 flex items-center justify-center text-lg">🧬</div>
  </div>
  
  <!-- Progress -->
  <div class="w-48 mb-4">
    <div class="h-1 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
      <div 
        class="h-full bg-black dark:bg-white transition-all duration-300 ease-out"
        style="width: {progress}%"
      ></div>
    </div>
    <div class="flex justify-between mt-1.5 text-xs text-gray-400">
      <span>{Math.round(progress)}%</span>
      <span>{message}</span>
    </div>
  </div>
  
  <!-- Privacy message -->
  <div class="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
    <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
    <span>{privacyMessages[currentMessageIndex]}</span>
  </div>
</div>
