<script lang="ts">
  import { lang, type AnalysisResults } from '$lib/stores/app';
  import { t } from '$lib/i18n/translations';
  
  export let results: AnalysisResults;
  
  function generateMarkdown(): string {
    let md = `# DNA Health Analysis Report\n\n`;
    md += `**Generated:** ${results.timestamp.toLocaleString()}\n\n`;
    md += `---\n\n`;
    
    md += `## Summary\n\n`;
    md += `- **SNPs Analyzed:** ${results.snpsAnalyzed}\n`;
    md += `- **Health Findings:** ${results.findings.length}\n`;
    md += `- **Drug Interactions:** ${results.drugInteractions.length}\n`;
    md += `- **Disease Risks:** ${results.diseaseRisks.length}\n\n`;
    
    md += `---\n\n`;
    md += `## Health Findings\n\n`;
    
    const highImpact = results.findings.filter(f => f.impact === 'high');
    const modImpact = results.findings.filter(f => f.impact === 'moderate');
    const lowImpact = results.findings.filter(f => f.impact === 'low' || f.impact === 'info');
    
    if (highImpact.length > 0) {
      md += `### 🔴 High Impact\n\n`;
      for (const f of highImpact) {
        md += `**${f.gene}** (${f.rsid}) - ${f.category}\n`;
        md += `- Genotype: \`${f.genotype}\`\n`;
        md += `- ${f.description}\n\n`;
      }
    }
    
    if (modImpact.length > 0) {
      md += `### 🟡 Moderate Impact\n\n`;
      for (const f of modImpact) {
        md += `**${f.gene}** (${f.rsid}) - ${f.category}\n`;
        md += `- Genotype: \`${f.genotype}\`\n`;
        md += `- ${f.description}\n\n`;
      }
    }
    
    if (lowImpact.length > 0) {
      md += `### 🟢 Low Impact / Informational\n\n`;
      for (const f of lowImpact) {
        md += `**${f.gene}** (${f.rsid}): ${f.description} [${f.genotype}]\n\n`;
      }
    }
    
    if (results.drugInteractions.length > 0) {
      md += `---\n\n`;
      md += `## 💊 Drug Interactions\n\n`;
      for (const d of results.drugInteractions) {
        md += `**${d.gene}** (${d.rsid}) - Level ${d.level}\n`;
        md += `- ${d.recommendation}\n`;
        md += `- Affected drugs: ${d.drugs.join(', ')}\n\n`;
      }
    }
    
    if (results.diseaseRisks.length > 0) {
      md += `---\n\n`;
      md += `## ⚠️ Disease Risk Variants\n\n`;
      for (const r of results.diseaseRisks) {
        md += `**${r.condition}** - ${r.significance}\n`;
        md += `- Gene: ${r.gene} (${r.rsid})\n`;
        md += `- ${r.interpretation}\n\n`;
      }
    }
    
    md += `---\n\n`;
    md += `*Disclaimer: This report is for educational purposes only. Consult healthcare professionals for medical decisions.*\n`;
    
    return md;
  }
  
  function generateText(): string {
    let txt = `DNA HEALTH ANALYSIS REPORT\n`;
    txt += `${'='.repeat(50)}\n\n`;
    txt += `Generated: ${results.timestamp.toLocaleString()}\n\n`;
    
    txt += `SUMMARY\n${'-'.repeat(30)}\n`;
    txt += `SNPs Analyzed: ${results.snpsAnalyzed}\n`;
    txt += `Health Findings: ${results.findings.length}\n`;
    txt += `Drug Interactions: ${results.drugInteractions.length}\n`;
    txt += `Disease Risks: ${results.diseaseRisks.length}\n\n`;
    
    txt += `HEALTH FINDINGS\n${'-'.repeat(30)}\n\n`;
    
    for (const f of results.findings) {
      txt += `[${f.impact.toUpperCase()}] ${f.gene} (${f.rsid})\n`;
      txt += `  Category: ${f.category}\n`;
      txt += `  Genotype: ${f.genotype}\n`;
      txt += `  ${f.description}\n\n`;
    }
    
    if (results.drugInteractions.length > 0) {
      txt += `\nDRUG INTERACTIONS\n${'-'.repeat(30)}\n\n`;
      for (const d of results.drugInteractions) {
        txt += `${d.gene} (${d.rsid}) - Level ${d.level}\n`;
        txt += `  ${d.recommendation}\n`;
        txt += `  Affected: ${d.drugs.join(', ')}\n\n`;
      }
    }
    
    if (results.diseaseRisks.length > 0) {
      txt += `\nDISEASE RISKS\n${'-'.repeat(30)}\n\n`;
      for (const r of results.diseaseRisks) {
        txt += `${r.condition} - ${r.significance}\n`;
        txt += `  Gene: ${r.gene} (${r.rsid})\n`;
        txt += `  ${r.interpretation}\n\n`;
      }
    }
    
    txt += `\nDISCLAIMER: For educational purposes only. Consult healthcare professionals for medical decisions.\n`;
    
    return txt;
  }
  
  function download(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function exportMD() {
    const md = generateMarkdown();
    download(md, 'dna-health-report.md', 'text/markdown');
  }
  
  function exportTXT() {
    const txt = generateText();
    download(txt, 'dna-health-report.txt', 'text/plain');
  }
  
  async function exportPDF() {
    // Dynamically import jsPDF for smaller bundle
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    let y = 20;
    const lineHeight = 7;
    const pageHeight = 280;
    
    function addLine(text: string, fontSize = 10, bold = false) {
      if (y > pageHeight) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(fontSize);
      if (bold) doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');
      
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 15, y);
      y += lines.length * lineHeight;
    }
    
    // Title
    addLine('DNA Health Analysis Report', 18, true);
    y += 5;
    addLine(`Generated: ${results.timestamp.toLocaleString()}`, 10);
    y += 10;
    
    // Summary
    addLine('Summary', 14, true);
    addLine(`SNPs Analyzed: ${results.snpsAnalyzed}`);
    addLine(`Health Findings: ${results.findings.length}`);
    addLine(`Drug Interactions: ${results.drugInteractions.length}`);
    addLine(`Disease Risks: ${results.diseaseRisks.length}`);
    y += 10;
    
    // Findings
    addLine('Health Findings', 14, true);
    y += 5;
    
    for (const f of results.findings.slice(0, 30)) { // Limit to prevent huge PDFs
      addLine(`${f.gene} (${f.rsid}) - ${f.impact.toUpperCase()}`, 11, true);
      addLine(`Category: ${f.category} | Genotype: ${f.genotype}`);
      addLine(f.description);
      y += 3;
    }
    
    // Disclaimer
    y += 10;
    addLine('Disclaimer: For educational purposes only. Consult healthcare professionals.', 8);
    
    doc.save('dna-health-report.pdf');
  }
</script>

<div class="flex flex-wrap gap-2">
  <button on:click={exportPDF} class="btn btn-secondary text-sm">
    PDF
  </button>
  <button on:click={exportMD} class="btn btn-secondary text-sm">
    Markdown
  </button>
  <button on:click={exportTXT} class="btn btn-secondary text-sm">
    Text
  </button>
</div>
