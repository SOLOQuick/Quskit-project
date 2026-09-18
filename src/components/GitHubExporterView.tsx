import React, { useState, useMemo } from 'react';
import { generateGitHubReadme, generateQAOADisasterPythonScript, generateJupyterNotebook } from '../lib/qiskitGenerator';
import { DISASTER_SCENARIOS } from '../lib/constants';
import { 
  GitBranch, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Terminal, 
  BookOpen, 
  FolderGit2, 
  CheckCircle2 
} from 'lucide-react';

export const GitHubExporterView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'README.md' | 'qaoa_disaster_relief.py' | 'requirements.txt' | 'notebook.ipynb'>('README.md');
  const [copied, setCopied] = useState<boolean>(false);

  const graph = DISASTER_SCENARIOS.coastal_cyclone;

  const readmeContent = useMemo(() => generateGitHubReadme(graph), [graph]);
  const pythonScript = useMemo(() => generateQAOADisasterPythonScript(graph, 2), [graph]);
  const jupyterNotebook = useMemo(() => generateJupyterNotebook(graph), [graph]);
  const requirementsTxt = `qiskit>=1.0.0
qiskit-aer>=0.14.0
networkx>=3.0
scipy>=1.11.0
matplotlib>=3.7.0
numpy>=1.24.0
`;

  const getActiveContent = () => {
    switch (activeFile) {
      case 'README.md': return readmeContent;
      case 'qaoa_disaster_relief.py': return pythonScript;
      case 'requirements.txt': return requirementsTxt;
      case 'notebook.ipynb': return jupyterNotebook;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getActiveContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase flex items-center gap-1">
              <FolderGit2 className="w-3 h-3" /> GitHub Repository Exporter
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100">
            Publish Ready Repository Artifacts
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
            All code files, requirements, Google Colab notebooks, and the comprehensive evaluation README formatted to competition rubrics.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors shadow"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Active File'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download File
          </button>
        </div>
      </div>

      {/* Git Command Quickstart */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs flex flex-col gap-2 shadow-lg">
        <div className="flex items-center gap-2 text-slate-400 font-bold">
          <Terminal className="w-4 h-4 text-purple-400" />
          Terminal Commands to Push to GitHub:
        </div>
        <pre className="text-slate-300 bg-slate-900/90 p-3 rounded border border-slate-800/80 overflow-x-auto">
{`git init
git add .
git commit -m "feat: QuantumLearn QAOA disaster relief logistics solver"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quantum-learn-disaster-qaoa.git
git push -u origin main`}
        </pre>
      </div>

      {/* File Tabs & Editor */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
        {/* File Tabs */}
        <div className="flex flex-wrap items-center bg-slate-950 border-b border-slate-800 px-3 pt-2 gap-2">
          {[
            { id: 'README.md', label: 'README.md' },
            { id: 'qaoa_disaster_relief.py', label: 'qaoa_disaster_relief.py' },
            { id: 'requirements.txt', label: 'requirements.txt' },
            { id: 'notebook.ipynb', label: 'disaster_relief_qaoa.ipynb' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFile(f.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-mono transition-colors border-t border-x ${
                activeFile === f.id
                  ? 'bg-slate-900 text-cyan-300 font-bold border-slate-700 border-b-transparent'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {f.label}
            </button>
          ))}
        </div>

        {/* File Viewer */}
        <div className="p-4 bg-slate-950 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
          <pre>{getActiveContent()}</pre>
        </div>
      </div>

      {/* Submission Rubrics Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Hackathon Rubrics Verification Checklist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100 block">Problem Understanding</strong>
              <span className="text-slate-400">Clear motivation on emergency disaster logistics & flood routing bottlenecks.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100 block">Quantum Approach</strong>
              <span className="text-slate-400">Rigorous QAOA formulation with Cost ($H_C$) and Mixer ($H_M$) Hamiltonians.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100 block">Qiskit Implementation</strong>
              <span className="text-slate-400">Standard Qiskit 1.x syntax with AerSimulator, SparsePauliOp, and parameter gates.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100 block">Working Prototype</strong>
              <span className="text-slate-400">Interactive live web app with Bloch spheres, circuit builder, and QAOA simulation.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100 block">Results & Analysis</strong>
              <span className="text-slate-400">Side-by-side approximation ratio ($\alpha$), convergence curves, and complexity comparison.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100 block">Innovation & Future Scope</strong>
              <span className="text-slate-400">Multi-commodity relief, satellite telemetry ingestion, and fault-tolerant transition.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
