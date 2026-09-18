import React, { useState } from 'react';
import { QuantumFoundationsView } from './components/QuantumFoundationsView';
import { CircuitComposer } from './components/CircuitComposer';
import { DisasterQAOASolver } from './components/DisasterQAOASolver';
import { ResultsAnalysisView } from './components/ResultsAnalysisView';
import { GitHubExporterView } from './components/GitHubExporterView';
import { AIMentorDrawer } from './components/AIMentorDrawer';
import { 
  Atom, 
  Cpu, 
  ShieldAlert, 
  BarChart3, 
  FolderGit2, 
  Bot, 
  Sparkles, 
  BookOpen, 
  Github,
  CheckCircle2,
  Share2
} from 'lucide-react';

type NavTab = 'foundations' | 'composer' | 'disaster_qaoa' | 'results' | 'github_export';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('foundations');
  const [isAIMentorOpen, setIsAIMentorOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Atom className="w-5 h-5 text-slate-950 animate-spin" style={{ animationDuration: '16s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white font-mono">
                Quantum<span className="text-cyan-400">Learn</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                Qiskit 1.x
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Interactive Quantum Computing Lab & Disaster Logistics QAOA Proof-of-Concept
            </p>
          </div>
        </div>

        {/* AI Mentor Trigger Button */}
        <button
          onClick={() => setIsAIMentorOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600/90 to-cyan-600/90 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-indigo-900/30 transition-all border border-cyan-400/30"
        >
          <Bot className="w-4 h-4 text-cyan-200" />
          <span>Ask AI Quantum Mentor</span>
          <Sparkles className="w-3 h-3 text-cyan-300" />
        </button>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="bg-slate-900/95 border-b border-slate-800/90 px-4 lg:px-8 py-2 flex items-center justify-start overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('foundations')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'foundations'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          1. Foundations & Bloch Sphere
        </button>

        <button
          onClick={() => setActiveTab('composer')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'composer'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          2. Quantum Circuit Composer
        </button>

        <button
          onClick={() => setActiveTab('disaster_qaoa')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'disaster_qaoa'
              ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 bg-indigo-950/40 border border-indigo-900/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          3. Disaster Logistics QAOA Solver
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'results'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          4. Results & Analysis
        </button>

        <button
          onClick={() => setActiveTab('github_export')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'github_export'
              ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          5. Publish & GitHub Exporter
        </button>
      </nav>

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8">
        {activeTab === 'foundations' && <QuantumFoundationsView />}
        {activeTab === 'composer' && <CircuitComposer />}
        {activeTab === 'disaster_qaoa' && <DisasterQAOASolver />}
        {activeTab === 'results' && <ResultsAnalysisView />}
        {activeTab === 'github_export' && <GitHubExporterView />}
      </main>

      {/* AI Mentor Drawer */}
      <AIMentorDrawer
        isOpen={isAIMentorOpen}
        onClose={() => setIsAIMentorOpen(false)}
        activeContext={
          activeTab === 'foundations' ? 'Quantum Superposition, Bloch Sphere, and Entanglement' :
          activeTab === 'composer' ? 'Circuit Composition and Gate Unitaries' :
          activeTab === 'disaster_qaoa' ? 'Disaster Relief Logistics and QAOA Hamiltonian Optimization' :
          activeTab === 'results' ? 'QAOA Approximation Ratios and NISQ Device Benchmarking' :
          'Qiskit 1.x and GitHub Repository Structure'
        }
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 px-4 lg:px-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400">QuantumLearn</span>
            <span>•</span>
            <span>Open Innovation Quantum Computing Proof-of-Concept</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Qiskit 1.x Compatible</span>
            <span>•</span>
            <span>Apache 2.0 License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
