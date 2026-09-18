import React, { useState, useMemo } from 'react';
import { DisasterGraph, QAOARunResult } from '../types';
import { DISASTER_SCENARIOS } from '../lib/constants';
import { runQAOADisasterSolver, evaluateDisasterCut, classicalOptimalCut } from '../lib/quantumEngine';
import { generateQAOADisasterPythonScript } from '../lib/qiskitGenerator';
import { 
  ShieldAlert, 
  Cpu, 
  Network, 
  TrendingUp, 
  Play, 
  RotateCcw, 
  Code, 
  Copy, 
  Check, 
  MapPin, 
  AlertTriangle,
  Zap,
  Activity,
  Award
} from 'lucide-react';

export const DisasterQAOASolver: React.FC = () => {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('coastal_cyclone');
  const [graph, setGraph] = useState<DisasterGraph>(DISASTER_SCENARIOS.coastal_cyclone);
  
  // QAOA Hyperparameters
  const [pLayers, setPLayers] = useState<number>(2);
  const [gammaParam, setGammaParam] = useState<number>(0.8);
  const [betaParam, setBetaParam] = useState<number>(0.4);
  const [shots, setShots] = useState<number>(1024);

  // Simulation execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<QAOARunResult | null>(() => {
    return runQAOADisasterSolver(DISASTER_SCENARIOS.coastal_cyclone, 2, 0.8, 0.4, 1024);
  });
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showCodeView, setShowCodeView] = useState<boolean>(false);

  // Switch scenario
  const handleScenarioChange = (key: string) => {
    setSelectedScenarioKey(key);
    const newGraph = DISASTER_SCENARIOS[key] || DISASTER_SCENARIOS.coastal_cyclone;
    setGraph(newGraph);
    const res = runQAOADisasterSolver(newGraph, pLayers, gammaParam, betaParam, shots);
    setResult(res);
  };

  // Run solver with animation
  const handleRunQAOA = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runQAOADisasterSolver(graph, pLayers, gammaParam, betaParam, shots);
      setResult(res);
      setIsRunning(false);
    }, 400);
  };

  const pythonScript = useMemo(() => {
    return generateQAOADisasterPythonScript(graph, pLayers);
  }, [graph, pLayers]);

  const copyScript = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Problem Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/60 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
              Open Innovation: Disaster Management
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
              Hybrid QAOA Proof-of-Concept
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100">
            Emergency Medical & Relief Supply Hub Partitioning
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
            When floods and cyclones sever transport arteries, classical solvers face exponential combinatorial scaling ($2^N$). 
            This proof-of-concept leverages the <strong>Quantum Approximate Optimization Algorithm (QAOA)</strong> in Qiskit to isolate high-risk corridors and cluster relief hubs into resilient autonomous sectors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedScenarioKey}
            onChange={(e) => handleScenarioChange(e.target.value)}
            className="bg-slate-950 border border-indigo-800 text-cyan-300 text-xs font-mono font-bold rounded-lg px-3 py-2"
          >
            <option value="coastal_cyclone">Coastal Cyclone Sandy (5 Hubs)</option>
            <option value="earthquake_zone">Seismic Fault Line (4 Hubs)</option>
          </select>

          <button
            onClick={() => setShowCodeView(!showCodeView)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            <Code className="w-3.5 h-3.5" /> {showCodeView ? 'Hide Qiskit' : 'Qiskit Script'}
          </button>
        </div>
      </div>

      {/* Main interactive grid: Map on left, QAOA parameters & metrics on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Disaster Logistics Network Visualizer */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              Humanitarian Network Topology & Partition Solution
            </h3>
            {result && (
              <span className="text-xs font-mono text-cyan-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                Optimal Cut: <strong className="text-emerald-400">|{result.optimalBitstring}⟩</strong>
              </span>
            )}
          </div>

          {/* Map canvas SVG */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 relative overflow-hidden">
            <svg viewBox="0 0 460 300" className="w-full h-[320px]">
              <defs>
                <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" opacity="0.6" />

              {/* Supply Corridor Edges */}
              {graph.edges.map(edge => {
                const u = graph.nodes[edge.source];
                const v = graph.nodes[edge.target];
                if (!u || !v) return null;

                // Is edge severed by the partition cut?
                const isCut = result && result.optimalBitstring[edge.source] !== result.optimalBitstring[edge.target];

                return (
                  <g key={edge.id}>
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke={isCut ? '#f43f5e' : '#475569'}
                      strokeWidth={isCut ? 3 : 1.5}
                      strokeDasharray={isCut ? '6 4' : undefined}
                      className={isCut ? 'animate-pulse' : undefined}
                    />
                    {/* Weight badge */}
                    <circle
                      cx={(u.x + v.x) / 2}
                      cy={(u.y + v.y) / 2}
                      r="11"
                      fill="#0f172a"
                      stroke={isCut ? '#f43f5e' : '#334155'}
                      strokeWidth="1.5"
                    />
                    <text
                      x={(u.x + v.x) / 2}
                      y={(u.y + v.y) / 2 + 3.5}
                      fill={isCut ? '#f43f5e' : '#94a3b8'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="font-mono"
                    >
                      {edge.riskWeight}
                    </text>
                  </g>
                );
              })}

              {/* Hub Nodes */}
              {graph.nodes.map(node => {
                const partition = result ? (result.optimalBitstring[node.id] === '0' ? 'Sector Alpha' : 'Sector Beta') : 'Unassigned';
                const isAlpha = result && result.optimalBitstring[node.id] === '0';

                return (
                  <g key={node.id} className="cursor-pointer">
                    {/* Pulsing ring for high-urgency nodes */}
                    {node.urgentNeed >= 8 && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="24"
                        fill="none"
                        stroke={isAlpha ? '#38bdf8' : '#ec4899'}
                        strokeWidth="1"
                        opacity="0.3"
                        className="animate-ping"
                      />
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="18"
                      fill="#0f172a"
                      stroke={isAlpha ? '#38bdf8' : '#ec4899'}
                      strokeWidth="2.5"
                    />

                    <text
                      x={node.x}
                      y={node.y + 4}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="font-mono"
                    >
                      q{node.id}
                    </text>

                    {/* Node label box */}
                    <rect
                      x={node.x - 55}
                      y={node.y + 22}
                      width="110"
                      height="18"
                      rx="3"
                      fill="#020617"
                      stroke="#1e293b"
                    />
                    <text
                      x={node.x}
                      y={node.y + 34}
                      fill={isAlpha ? '#7dd3fc' : '#f472b6'}
                      fontSize="8.5"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {node.name.length > 18 ? node.name.slice(0, 16) + '…' : node.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-2 left-2 bg-slate-950/90 border border-slate-800 p-2.5 rounded-lg flex items-center gap-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-slate-300">Sector Alpha (|0⟩)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                <span className="text-slate-300">Sector Beta (|1⟩)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 border-t-2 border-dashed border-rose-500" />
                <span className="text-rose-400">Flooded Cut Edge</span>
              </div>
            </div>
          </div>

          {/* Node Summary details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-sky-950">
              <span className="font-bold text-sky-400 block mb-1">Sector Alpha Hubs:</span>
              <ul className="text-slate-300 flex flex-col gap-1">
                {result?.partitionA.map(id => {
                  const n = graph.nodes[id];
                  return (
                    <li key={id} className="flex justify-between font-mono text-[11px]">
                      <span>• {n.name}</span>
                      <span className="text-slate-500">Need: {n.urgentNeed}/10</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-pink-950">
              <span className="font-bold text-pink-400 block mb-1">Sector Beta Hubs:</span>
              <ul className="text-slate-300 flex flex-col gap-1">
                {result?.partitionB.map(id => {
                  const n = graph.nodes[id];
                  return (
                    <li key={id} className="flex justify-between font-mono text-[11px]">
                      <span>• {n.name}</span>
                      <span className="text-slate-500">Need: {n.urgentNeed}/10</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: QAOA Controls, Execution & Results */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* QAOA Parameters Control */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                QAOA Variational Parameters
              </h3>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                p = {pLayers} Layers
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Alternating Layers (p):</span>
                  <span className="text-cyan-400 font-bold">{pLayers}</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map(p => (
                    <button
                      key={p}
                      onClick={() => setPLayers(p)}
                      className={`flex-1 py-1.5 rounded transition-all border ${
                        pLayers === p
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      p = {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Cost Angle (γ):</span>
                  <span className="text-cyan-400 font-bold">{gammaParam.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.14"
                  step="0.05"
                  value={gammaParam}
                  onChange={(e) => setGammaParam(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Mixer Angle (β):</span>
                  <span className="text-pink-400 font-bold">{betaParam.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.57"
                  step="0.05"
                  value={betaParam}
                  onChange={(e) => setBetaParam(parseFloat(e.target.value))}
                  className="w-full accent-pink-400 h-1.5 bg-slate-800 rounded"
                />
              </div>
            </div>

            <button
              onClick={handleRunQAOA}
              disabled={isRunning}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {isRunning ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" /> Transpiling & Running QAOA on Aer...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Run Hybrid Optimization Loop
                </>
              )}
            </button>
          </div>

          {/* Results & Benchmark Card */}
          {result && (
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Performance Metrics & Approximation Ratio
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {result.executionTimeMs}ms
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">QAOA Expected Cut ⟨HC⟩</span>
                  <span className="text-lg font-bold text-cyan-400">{result.expectedCost}</span>
                  <span className="text-[10px] text-slate-500 block">Weighted Disaster Cut</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Approximation Ratio (α)</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {(result.approximationRatio * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Of Theoretical Max ({result.maxPossibleCost})</span>
                </div>
              </div>

              {/* Convergence Trajectory Mini-Graph */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  Hybrid Classical-Quantum Convergence Curve (COBYLA):
                </span>
                <div className="h-16 flex items-end gap-1.5 pt-2">
                  {result.convergenceHistory.map((pt, idx) => {
                    const heightPct = result.maxPossibleCost > 0 ? (pt.cost / result.maxPossibleCost) * 100 : 50;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className="w-full bg-indigo-500 hover:bg-cyan-400 rounded-t transition-all"
                          style={{ height: `${Math.max(heightPct, 8)}%` }}
                        />
                        <span className="text-[8px] text-slate-500 font-mono">{pt.step}</span>
                        {/* Tooltip */}
                        <div className="absolute -top-8 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 font-mono">
                          {pt.cost} (γ:{pt.gamma}, β:{pt.beta})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bitstring Probability Distribution */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  Most Likely Partition Bitstrings (1024 Shots):
                </span>
                {Object.entries(result.distribution)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([bstr, count]) => {
                    const pct = (count / 1024) * 100;
                    const isWinner = bstr === result.optimalBitstring;
                    return (
                      <div key={bstr} className="flex items-center gap-2 text-xs font-mono">
                        <span className={`w-14 font-bold ${isWinner ? 'text-emerald-400' : 'text-slate-400'}`}>
                          |{bstr}⟩
                        </span>
                        <div className="flex-1 h-4 bg-slate-950 rounded overflow-hidden relative border border-slate-800">
                          <div
                            className={`h-full ${isWinner ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            style={{ width: `${pct}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-end px-2 text-[10px] text-slate-300">
                            {count} shots ({pct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Qiskit Code Modal/Drawer */}
      {showCodeView && (
        <div className="bg-slate-900/95 border border-indigo-900/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100 font-mono">
                Production-Ready Qiskit 1.x Script (qaoa_disaster_relief.py)
              </h3>
            </div>
            <button
              onClick={copyScript}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'Copied to Clipboard!' : 'Copy Script'}
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 max-h-96 overflow-y-auto">
            <pre>{pythonScript}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
