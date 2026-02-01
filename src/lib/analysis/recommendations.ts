/**
 * Human-Friendly Recommendations Engine
 * Provides actionable advice for behavior, food, and supplements
 * Based on SNP findings - all recommendations in plain language
 */

export interface Recommendation {
  category: 'food' | 'supplement' | 'lifestyle' | 'medical' | 'avoid';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  evidence: string;
}

/**
 * SNP-specific recommendations database
 * Maps rsID -> genotype -> recommendations
 */
export const SNP_RECOMMENDATIONS: Record<string, Record<string, Recommendation[]>> = {
  // ==========================================
  // METHYLATION / FOLATE
  // ==========================================
  'rs1801133': { // MTHFR C677T
    'TT': [
      { category: 'supplement', title: 'Take methylfolate instead of folic acid', description: 'Your body has trouble converting folic acid to its active form. Use "methylfolate" or "5-MTHF" supplements (400-800mcg daily).', priority: 'high', evidence: 'Well-established' },
      { category: 'food', title: 'Eat folate-rich foods', description: 'Leafy greens (spinach, kale), legumes, asparagus, and avocado provide natural folate your body can use.', priority: 'medium', evidence: 'Supportive' },
      { category: 'avoid', title: 'Avoid fortified foods with folic acid', description: 'Many breads and cereals are fortified with synthetic folic acid which may build up. Choose unfortified options.', priority: 'medium', evidence: 'Emerging' },
      { category: 'supplement', title: 'Consider B12 as methylcobalamin', description: 'Take B12 in its active "methylcobalamin" form (1000mcg) to support methylation.', priority: 'medium', evidence: 'Supportive' },
    ],
    'CT': [
      { category: 'supplement', title: 'Methylfolate may help', description: 'You have one copy - methylfolate supplements (400mcg) can be beneficial, especially during pregnancy or high-stress periods.', priority: 'low', evidence: 'Supportive' },
      { category: 'food', title: 'Include folate-rich foods daily', description: 'Leafy greens, legumes, and citrus fruits support your folate needs naturally.', priority: 'low', evidence: 'Supportive' },
    ],
  },
  
  // ==========================================
  // VITAMIN D
  // ==========================================
  'rs2282679': { // GC (Vitamin D binding protein)
    'CC': [
      { category: 'supplement', title: 'You likely need more vitamin D', description: 'Take 2000-4000 IU vitamin D3 daily, especially in winter. Get blood levels tested (aim for 40-60 ng/mL).', priority: 'high', evidence: 'Well-established' },
      { category: 'lifestyle', title: 'Get 15-20 min midday sun', description: 'When possible, get sun exposure on arms/legs without sunscreen for vitamin D synthesis.', priority: 'medium', evidence: 'Supportive' },
      { category: 'food', title: 'Eat vitamin D rich foods', description: 'Fatty fish (salmon, mackerel), egg yolks, and fortified foods help but likely not enough alone.', priority: 'low', evidence: 'Supportive' },
    ],
    'AC': [
      { category: 'supplement', title: 'Consider vitamin D supplement', description: 'Take 1000-2000 IU vitamin D3 daily, especially if you get little sun exposure.', priority: 'medium', evidence: 'Supportive' },
    ],
  },
  
  // ==========================================
  // CAFFEINE
  // ==========================================
  'rs762551': { // CYP1A2 - caffeine metabolism
    'AC': [
      { category: 'lifestyle', title: 'Limit afternoon caffeine', description: 'You metabolize caffeine slowly (~8 hour half-life). No coffee after 12-2pm for good sleep.', priority: 'high', evidence: 'Well-established' },
      { category: 'avoid', title: 'Watch coffee and heart health', description: 'More than 2-3 cups/day may increase cardiovascular risk for slow metabolizers. Stick to morning coffee.', priority: 'medium', evidence: 'Emerging' },
      { category: 'lifestyle', title: 'Try half-caff or tea', description: 'Green tea has L-theanine which provides calm energy without the jitters.', priority: 'low', evidence: 'Supportive' },
    ],
    'CC': [
      { category: 'lifestyle', title: 'Strict caffeine cutoff needed', description: 'Very slow caffeine metabolism. Avoid caffeine after 10am, or skip it entirely for better sleep.', priority: 'high', evidence: 'Well-established' },
      { category: 'avoid', title: 'Coffee may not be protective for you', description: 'Unlike fast metabolizers, coffee\'s heart benefits don\'t apply to you. Limit to 1 cup/day max.', priority: 'high', evidence: 'Emerging' },
    ],
  },
  
  // ==========================================
  // LACTOSE
  // ==========================================
  'rs4988235': { // LCT/MCM6 - lactose persistence
    'GG': [
      { category: 'food', title: 'Use lactose-free dairy', description: 'You\'re lactose intolerant. Choose lactose-free milk, or try almond/oat milk alternatives.', priority: 'high', evidence: 'Well-established' },
      { category: 'supplement', title: 'Take lactase enzyme when needed', description: 'Lactaid pills before dairy let you enjoy cheese/ice cream without issues.', priority: 'medium', evidence: 'Well-established' },
      { category: 'food', title: 'Aged cheeses are usually OK', description: 'Parmesan, cheddar, and swiss have very little lactose and are usually well-tolerated.', priority: 'low', evidence: 'Well-established' },
      { category: 'food', title: 'Greek yogurt may be tolerable', description: 'The fermentation process reduces lactose. Start with small amounts to test.', priority: 'low', evidence: 'Supportive' },
    ],
  },
  
  // ==========================================
  // COMT (Stress/Dopamine)
  // ==========================================
  'rs4680': { // COMT Val158Met
    'AA': [ // Met/Met - "Worrier"
      { category: 'lifestyle', title: 'Prioritize stress management', description: 'Your brain holds dopamine longer - great for focus, but stress accumulates. Daily meditation, yoga, or walks are essential.', priority: 'high', evidence: 'Well-established' },
      { category: 'avoid', title: 'Go easy on stimulants', description: 'Caffeine, energy drinks, and high-stress situations hit you harder. Build in recovery time.', priority: 'medium', evidence: 'Supportive' },
      { category: 'supplement', title: 'Magnesium supports calm', description: 'Magnesium glycinate (200-400mg at night) helps with relaxation and sleep.', priority: 'medium', evidence: 'Supportive' },
      { category: 'food', title: 'Include calming foods', description: 'Green tea (L-theanine), fatty fish (omega-3s), and dark chocolate support balanced mood.', priority: 'low', evidence: 'Supportive' },
      { category: 'lifestyle', title: 'You may excel at detailed work', description: 'Your genetic profile is associated with better working memory and attention to detail. Use this strength!', priority: 'low', evidence: 'Emerging' },
    ],
    'GG': [ // Val/Val - "Warrior"
      { category: 'lifestyle', title: 'You handle stress well', description: 'Your brain clears dopamine quickly - you perform well under pressure but may need more stimulation.', priority: 'low', evidence: 'Supportive' },
      { category: 'food', title: 'Protein supports dopamine', description: 'Include protein at each meal (eggs, meat, legumes) to maintain dopamine precursors.', priority: 'low', evidence: 'Supportive' },
    ],
  },
  
  // ==========================================
  // FTO (Obesity)
  // ==========================================
  'rs9939609': { // FTO obesity risk
    'AA': [
      { category: 'lifestyle', title: 'Exercise is extra effective for you', description: 'Good news: people with your variant respond better to exercise than average. 30+ min daily makes a big difference.', priority: 'high', evidence: 'Well-established' },
      { category: 'food', title: 'Higher protein diet helps', description: 'Aim for 25-30% calories from protein - it increases satiety more for your genotype.', priority: 'high', evidence: 'Emerging' },
      { category: 'lifestyle', title: 'Don\'t skip meals', description: 'Your variant is associated with increased hunger. Regular meals prevent overeating later.', priority: 'medium', evidence: 'Supportive' },
      { category: 'avoid', title: 'Limit ultra-processed foods', description: 'Your genotype may be more sensitive to hyper-palatable foods. Whole foods help control appetite.', priority: 'medium', evidence: 'Emerging' },
    ],
    'AT': [
      { category: 'lifestyle', title: 'Regular exercise helps manage weight', description: 'You have moderate genetic obesity risk. 150+ minutes of activity weekly is protective.', priority: 'medium', evidence: 'Supportive' },
      { category: 'food', title: 'Focus on protein and fiber', description: 'These keep you fuller longer and help manage the moderate FTO effect.', priority: 'low', evidence: 'Supportive' },
    ],
  },
  
  // ==========================================
  // APOE (Alzheimer's/Heart)
  // ==========================================
  'rs429358': { // APOE (part of ε4 detection)
    'CT': [ // One ε4 allele
      { category: 'lifestyle', title: 'Exercise is neuroprotective', description: 'Regular aerobic exercise (30+ min, 5x/week) significantly reduces Alzheimer\'s risk for ε4 carriers.', priority: 'high', evidence: 'Well-established' },
      { category: 'food', title: 'Mediterranean diet recommended', description: 'Olive oil, fish, vegetables, nuts, and moderate wine intake are protective for your genotype.', priority: 'high', evidence: 'Well-established' },
      { category: 'lifestyle', title: 'Prioritize sleep', description: '7-8 hours quality sleep helps clear brain amyloid. Sleep apnea should be treated.', priority: 'high', evidence: 'Emerging' },
      { category: 'avoid', title: 'Limit saturated fat', description: 'APOE ε4 carriers are more sensitive to dietary saturated fat. Choose olive oil over butter.', priority: 'medium', evidence: 'Supportive' },
      { category: 'supplement', title: 'Omega-3s may help', description: 'DHA (from fish oil, 1000mg+) supports brain health, especially important for ε4 carriers.', priority: 'medium', evidence: 'Emerging' },
      { category: 'avoid', title: 'Minimize alcohol', description: 'APOE ε4 increases alcohol\'s negative effects on the brain. Limit to occasional use.', priority: 'medium', evidence: 'Emerging' },
    ],
    'CC': [ // Two ε4 alleles (homozygous)
      { category: 'medical', title: 'Work with a doctor proactively', description: 'With two ε4 alleles, proactive brain health monitoring is recommended. Ask about cognitive testing baseline.', priority: 'high', evidence: 'Well-established' },
      { category: 'lifestyle', title: 'Exercise is your best medicine', description: 'Daily aerobic exercise can reduce risk by 50%+ even with ε4/ε4. Make it non-negotiable.', priority: 'high', evidence: 'Well-established' },
      { category: 'food', title: 'Strict Mediterranean diet', description: 'Strong evidence this diet is protective. Emphasize fatty fish, olive oil, leafy greens, berries.', priority: 'high', evidence: 'Well-established' },
    ],
  },
  
  // ==========================================
  // ACTN3 (Athletic Performance)
  // ==========================================
  'rs1815739': { // ACTN3 R577X
    'CC': [ // R/R - Power/sprint
      { category: 'lifestyle', title: 'You\'re built for power sports', description: 'Your muscles favor explosive movements. Sprinting, weightlifting, jumping sports suit your genetics.', priority: 'low', evidence: 'Well-established' },
      { category: 'lifestyle', title: 'Include strength training', description: 'You may gain muscle more easily than average. Take advantage with resistance training.', priority: 'low', evidence: 'Supportive' },
    ],
    'TT': [ // X/X - Endurance
      { category: 'lifestyle', title: 'You may excel at endurance', description: 'Your variant is common in elite endurance athletes. Running, cycling, swimming suit your genetics.', priority: 'low', evidence: 'Well-established' },
      { category: 'lifestyle', title: 'Don\'t neglect strength work', description: 'While you favor endurance, some strength training prevents injury and improves performance.', priority: 'low', evidence: 'Supportive' },
    ],
  },
  
  // ==========================================
  // SLCO1B1 (Statin Response)
  // ==========================================
  'rs4149056': { // SLCO1B1 - statin myopathy
    'TC': [
      { category: 'medical', title: 'Tell your doctor about statin sensitivity', description: 'You have increased risk of muscle pain from simvastatin/atorvastatin. Lower doses or alternatives (pravastatin, rosuvastatin) may be better.', priority: 'high', evidence: 'Well-established' },
      { category: 'supplement', title: 'CoQ10 may help if on statins', description: 'If you take statins, CoQ10 (100-200mg daily) may reduce muscle side effects.', priority: 'medium', evidence: 'Supportive' },
    ],
    'CC': [
      { category: 'medical', title: 'High statin sensitivity - discuss alternatives', description: 'You have significantly increased myopathy risk with simvastatin. Use pravastatin or rosuvastatin instead, or lowest effective dose.', priority: 'high', evidence: 'Well-established' },
    ],
  },
  
  // ==========================================
  // CYP2C9 (Warfarin)
  // ==========================================
  'rs1799853': { // CYP2C9 *2
    'TC': [
      { category: 'medical', title: 'Lower warfarin dose likely needed', description: 'If prescribed warfarin (blood thinner), you probably need 10-25% less than standard. Share this with your doctor.', priority: 'high', evidence: 'Well-established' },
      { category: 'medical', title: 'Be careful with NSAIDs', description: 'Ibuprofen, naproxen may stay in your system longer. Use lowest effective dose.', priority: 'medium', evidence: 'Supportive' },
    ],
    'CC': [
      { category: 'medical', title: 'Significantly lower warfarin dose needed', description: 'You metabolize warfarin slowly. If ever prescribed, expect ~50% lower dose. This is critical information for doctors.', priority: 'high', evidence: 'Well-established' },
    ],
  },
  
  // ==========================================
  // HFE (Iron)
  // ==========================================
  'rs1800562': { // HFE C282Y
    'AG': [
      { category: 'medical', title: 'Monitor iron levels periodically', description: 'You\'re a hemochromatosis carrier. Get ferritin checked every few years; iron overload is unlikely but possible.', priority: 'medium', evidence: 'Well-established' },
      { category: 'avoid', title: 'Skip iron supplements unless deficient', description: 'Don\'t take iron supplements unless blood tests show you need them.', priority: 'medium', evidence: 'Well-established' },
    ],
    'AA': [
      { category: 'medical', title: 'Get iron/ferritin tested regularly', description: 'You have hemochromatosis genotype. Annual ferritin testing is important; high iron causes organ damage.', priority: 'high', evidence: 'Well-established' },
      { category: 'avoid', title: 'Avoid iron supplements and vitamin C with meals', description: 'Vitamin C increases iron absorption. Don\'t take iron supplements. Avoid cast iron cookware.', priority: 'high', evidence: 'Well-established' },
      { category: 'medical', title: 'Blood donation helps', description: 'If iron is high, regular blood donation is therapeutic and helps others. Discuss with doctor.', priority: 'medium', evidence: 'Well-established' },
      { category: 'avoid', title: 'Limit alcohol', description: 'Alcohol accelerates iron-related liver damage. Minimize or avoid if ferritin is elevated.', priority: 'high', evidence: 'Well-established' },
    ],
  },
  
  // ==========================================
  // ALDH2 (Alcohol)
  // ==========================================
  'rs671': { // ALDH2 - alcohol flush
    'AG': [
      { category: 'avoid', title: 'Limit alcohol significantly', description: 'You have alcohol flush reaction and increased esophageal cancer risk with drinking. Best to avoid or strictly limit.', priority: 'high', evidence: 'Well-established' },
      { category: 'medical', title: 'No "pushing through" flushing', description: 'The flush isn\'t just uncomfortable - it indicates acetaldehyde (carcinogen) buildup. Don\'t ignore it.', priority: 'high', evidence: 'Well-established' },
    ],
    'AA': [
      { category: 'avoid', title: 'Avoid alcohol entirely', description: 'You have severe alcohol intolerance and very high cancer risk with any alcohol. Complete avoidance recommended.', priority: 'high', evidence: 'Well-established' },
    ],
  },
  
  // ==========================================
  // Bitter Taste (TAS2R38)
  // ==========================================
  'rs713598': { // TAS2R38
    'CC': [ // PAV - taster
      { category: 'food', title: 'Bitter vegetables may need preparation', description: 'You taste bitter compounds strongly. Roasting, sautéing with garlic/oil, or adding acid makes kale, Brussels sprouts more palatable.', priority: 'low', evidence: 'Well-established' },
      { category: 'food', title: 'You may prefer sweeter vegetables', description: 'Carrots, sweet potatoes, beets are naturally appealing to supertasters. Use them as your veggie base.', priority: 'low', evidence: 'Supportive' },
    ],
    'GG': [ // AVI - non-taster
      { category: 'food', title: 'You can enjoy bitter greens easily', description: 'Kale, arugula, radicchio, dark chocolate - you don\'t taste the bitter compounds that others do. Take advantage!', priority: 'low', evidence: 'Well-established' },
    ],
  },
  
  // ==========================================
  // PON1 (Detox)
  // ==========================================
  'rs662': { // PON1 Q192R
    'TT': [ // Q/Q - lower activity
      { category: 'food', title: 'Choose organic when possible', description: 'Your body is slower at breaking down organophosphate pesticides. Prioritize organic for the "dirty dozen" produce.', priority: 'medium', evidence: 'Supportive' },
      { category: 'supplement', title: 'Antioxidants support detox', description: 'Vitamin C, E, and pomegranate may help support your PON1 enzyme function.', priority: 'low', evidence: 'Emerging' },
    ],
  },
  
  // ==========================================
  // LPA (Cardiovascular)
  // ==========================================
  'rs10455872': { // LPA - Lp(a)
    'AG': [
      { category: 'medical', title: 'Get Lp(a) blood test', description: 'You likely have elevated Lp(a), an independent heart disease risk factor. Get it tested (one-time test, levels don\'t change).', priority: 'high', evidence: 'Well-established' },
      { category: 'lifestyle', title: 'Extra focus on other risk factors', description: 'Since Lp(a) isn\'t easily lowered, optimize what you can: exercise, blood pressure, LDL cholesterol, no smoking.', priority: 'high', evidence: 'Well-established' },
      { category: 'medical', title: 'Discuss aspirin with doctor', description: 'Low-dose aspirin may be beneficial for elevated Lp(a). Discuss risk/benefit with your doctor.', priority: 'medium', evidence: 'Emerging' },
    ],
    'GG': [
      { category: 'medical', title: 'High Lp(a) likely - comprehensive cardiac workup', description: 'Strongly elevated Lp(a) risk. Get tested and work with cardiologist on aggressive prevention.', priority: 'high', evidence: 'Well-established' },
    ],
  },
};

/**
 * Get recommendations for a specific SNP and genotype
 */
export function getRecommendations(rsid: string, genotype: string): Recommendation[] {
  const snpRecs = SNP_RECOMMENDATIONS[rsid.toLowerCase()] || SNP_RECOMMENDATIONS[rsid.toUpperCase()];
  if (!snpRecs) return [];
  
  const genotypeUpper = genotype.toUpperCase();
  
  // Try exact match
  if (snpRecs[genotypeUpper]) {
    return snpRecs[genotypeUpper];
  }
  
  // Try reversed genotype
  const reversed = genotypeUpper.split('').reverse().join('');
  if (snpRecs[reversed]) {
    return snpRecs[reversed];
  }
  
  return [];
}

/**
 * Get all recommendations for a list of SNP findings
 */
export function getAllRecommendations(findings: Array<{ rsid: string; genotype: string }>): Map<string, Recommendation[]> {
  const allRecs = new Map<string, Recommendation[]>();
  
  for (const finding of findings) {
    const recs = getRecommendations(finding.rsid, finding.genotype);
    if (recs.length > 0) {
      allRecs.set(finding.rsid, recs);
    }
  }
  
  return allRecs;
}

/**
 * Organize recommendations by category
 */
export function organizeByCategory(allRecs: Map<string, Recommendation[]>): Record<string, Recommendation[]> {
  const organized: Record<string, Recommendation[]> = {
    food: [],
    supplement: [],
    lifestyle: [],
    medical: [],
    avoid: [],
  };
  
  for (const recs of allRecs.values()) {
    for (const rec of recs) {
      organized[rec.category].push(rec);
    }
  }
  
  // Sort each category by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  for (const category of Object.keys(organized)) {
    organized[category].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  
  return organized;
}
