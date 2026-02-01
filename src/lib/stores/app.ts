import { writable, derived } from 'svelte/store';
import { detectLanguage, type Language } from '$lib/i18n/translations';

// Theme
function createThemeStore() {
  const { subscribe, set, update } = writable<'light' | 'dark'>('light');
  
  return {
    subscribe,
    toggle: () => update(t => t === 'light' ? 'dark' : 'light'),
    set,
    init: () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme');
        // Default to light mode, only use dark if explicitly set by user
        const theme = stored || 'light';
        set(theme as 'light' | 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    }
  };
}

export const theme = createThemeStore();

// Language
function createLangStore() {
  const { subscribe, set } = writable<Language>(detectLanguage());
  
  return {
    subscribe,
    set: (lang: Language) => {
      set(lang);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('lang', lang);
      }
    },
    init: () => {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('lang') as Language | null;
        if (stored) set(stored);
      }
    }
  };
}

export const lang = createLangStore();

// Analysis state
export interface SNPResult {
  rsid: string;
  gene: string;
  category: string;
  genotype: string;
  status: string;
  description: string;
  magnitude: number;
  impact: 'high' | 'moderate' | 'low' | 'info';
}

export interface DrugInteraction {
  rsid: string;
  gene: string;
  drugs: string[];
  level: string;
  recommendation: string;
}

export interface DiseaseRisk {
  rsid: string;
  gene: string;
  condition: string;
  significance: string;
  interpretation: string;
}

export interface AnalysisResults {
  snpsAnalyzed: number;
  snpsTotal: number;
  findings: SNPResult[];
  drugInteractions: DrugInteraction[];
  diseaseRisks: DiseaseRisk[];
  timestamp: Date;
}

export type AnalysisState = 
  | { status: 'idle' }
  | { status: 'loading-db'; progress: number }
  | { status: 'analyzing'; progress: number }
  | { status: 'complete'; results: AnalysisResults }
  | { status: 'error'; message: string };

export const analysisState = writable<AnalysisState>({ status: 'idle' });

// Categories for filtering
export const categories = [
  'all',
  'health',
  'nutrition',
  'pharma',
  'sleep',
  'fitness',
  'cardio',
  'mental',
  'longevity',
  'immunity',
  'skin',
  'vision',
  'pain',
  'ancestry'
] as const;

export type Category = typeof categories[number];

export const selectedCategory = writable<Category>('all');

// Filtered results
export const filteredFindings = derived(
  [analysisState, selectedCategory],
  ([$state, $category]) => {
    if ($state.status !== 'complete') return [];
    if ($category === 'all') return $state.results.findings;
    
    const categoryMap: Record<string, string[]> = {
      health: ['Health', 'Autoimmune', 'Respiratory'],
      nutrition: ['Nutrition', 'Iron Metabolism'],
      pharma: ['Drug Metabolism', 'Pharmacogenomics'],
      sleep: ['Sleep/Circadian', 'Sleep'],
      fitness: ['Fitness', 'Sports'],
      cardio: ['Cardiovascular'],
      mental: ['Neurotransmitters', 'Mental Health', 'Psychology', 'Cognitive'],
      longevity: ['Longevity', 'Aging'],
      immunity: ['Immunity', 'Inflammation'],
      skin: ['Skin'],
      vision: ['Vision', 'Hearing'],
      pain: ['Pain'],
      ancestry: ['Ancestry', 'Pigmentation']
    };
    
    const cats = categoryMap[$category] || [$category];
    return $state.results.findings.filter(f => 
      cats.some(c => f.category.toLowerCase().includes(c.toLowerCase()))
    );
  }
);
