import React, { useState, useMemo } from 'react';
import { CircuitState, Gate, GateType } from '../types';
import { simulateCircuit } from '../lib/quantumEngine';
import { generateQiskitCircuitCode } from '../lib/qiskitGenerator';
import { CIRCUIT_PRESETS } from '../lib/constants';
import { BlochSphereCanvas } from './BlochSphereCanvas';
import { 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  Sliders, 
  ChevronRight,
  BarChart3
} from 'lucide-react';

export const CircuitComposer: React.FC = () => {
  const [numQubits, setNumQubits] = useState<number>(2);
  const [gates, setGates] = useState<Gate[]>([
    { id: 'g0', type: 'H', qubit: 0, step: 0 },
    { id: 'g1', type: 'CNOT', qubit: 1, controlQubit: 0, step: 1 },
  ]);
  const [activeStep, setActiveStep] = useState<number | undefined>(undefined);
  const [selectedGateType, setSelectedGateType] = useState<GateType>('H');
  const [controlQubit, setControlQubit] = useState<number>(0);
  const [rotationAngle, setRotationAngle] = useState<number>(Math.PI / 2);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);

  const maxSteps = 8;

  // Simulate current circuit state
  const simulationResult = useMemo(() => {
    return simulateCircuit(numQubits, gates, activeStep, 1024);
  }, [numQubits, gates, activeStep]);

  // Load preset
  const loadPreset = (presetId: string) => {
    const preset = CIRCUIT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setNumQubits(preset.numQubits);
      setGates(preset.gates);
      setActiveStep(undefined);
    }
  };

  // Add gate to grid cell
  const handleCellClick = (qubit: number, step: number) => {
    // Check if cell already has a gate
    const existingIndex = gates.findIndex(g => g.qubit === qubit && g.step === step);
    if (existingIndex >= 0) {
      // Remove existing gate
      setGates(gates.filter((_, idx) => idx !== existingIndex));
      return;
    }

    const newGate: Gate = {
      id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: selectedGateType,
      qubit,
      step,
      param: (selectedGateType === 'RX' || selectedGateType === 'RY' || selectedGateType === 'RZ') ? rotationAngle : undefined,
      controlQubit: (selectedGateType === 'CNOT' || selectedGateType === 'CZ' || selectedGateType === 'SWAP') ? controlQubit : undefined,
    };

    setGates([...gates, newGate]);
  };

  const removeGate = (gateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGates(gates.filter(g => g.id !== gateId));
  };

  const clearCircuit = () => {
    setGates([]);
    setActiveStep(undefined);
  };

  const qiskitCode = useMemo(() => {
    return generateQiskitCircuitCode({ numQubits, maxSteps, gates, activeStep });
  }, [numQubits, maxSteps, gates, activeStep]);

  const copyQiskitCode = () => {
    navigator.clipboard.writeText(qiskitCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Controls & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span>Qubits:</span>
            <select
              value={numQubits}
              onChange={(e) => {
                const n = parseInt(e.target.value);
                setNumQubits(n);
                setGates(gates.filter(g => g.qubit < n && (g.controlQubit === undefined || g.controlQubit < n)));
              }}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-cyan-400 font-bold"
            >
              <option value={1}>1 Qubit</option>
              <option value={2}>2 Qubits</option>
              <option value={3}>3 Qubits</option>
              <option value={4}>4 Qubits</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span>Presets:</span>
            <select
              onChange={(e) => loadPreset(e.target.value)}
              defaultValue=""
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
            >
              <option value="" disabled>Load Algorithm / State...</option>
              {CIRCUIT_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Step scrubber */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setActiveStep(undefined)}
              className={`px-2.5 py-1 rounded font-mono ${activeStep === undefined ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="Full Circuit Execution"
            >
              All Steps
            </button>
            {Array.from({ length: maxSteps }).map((_, stepIdx) => (
              <button
                key={stepIdx}
                onClick={() => setActiveStep(stepIdx)}
                className={`w-6 h-6 rounded text-[11px] font-mono transition-colors ${
                  activeStep === stepIdx ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {stepIdx}
              </button>
            ))}
          </div>

          <button
            onClick={clearCircuit}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            title="Clear Circuit"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            <Code className="w-3.5 h-3.5" /> Qiskit Code
          </button>
        </div>
      </div>

      {/* Gate Palette Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Select Gate to Place:
          </span>
          <span className="text-xs text-slate-400">
            Click on any circuit grid wire to place or remove a gate.
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['H', 'X', 'Y', 'Z', 'S', 'T', 'CNOT', 'CZ', 'SWAP', 'RX', 'RY', 'RZ', 'MEASURE'] as GateType[]).map(gType => (
            <button
              key={gType}
              onClick={() => setSelectedGateType(gType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                selectedGateType === gType
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-105'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {gType}
            </button>
          ))}
        </div>

        {/* Multi-qubit or angle parameter settings if needed */}
        {(selectedGateType === 'CNOT' || selectedGateType === 'CZ' || selectedGateType === 'SWAP') && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-amber-400 font-semibold">Control Qubit for {selectedGateType}:</span>
            <div className="flex gap-1.5">
              {Array.from({ length: numQubits }).map((_, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => setControlQubit(qIdx)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    controlQubit === qIdx ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Q{qIdx}
                </button>
              ))}
            </div>
          </div>
        )}

        {(selectedGateType === 'RX' || selectedGateType === 'RY' || selectedGateType === 'RZ') && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-pink-400 font-semibold">Rotation Angle θ:</span>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.05"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(parseFloat(e.target.value))}
              className="w-48 accent-pink-500 h-1.5 bg-slate-800 rounded"
            />
            <span>{((rotationAngle * 180) / Math.PI).toFixed(0)}°</span>
          </div>
        )}
      </div>

      {/* Circuit Grid Wireboard */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-lg overflow-x-auto">
        <div className="min-w-[640px] flex flex-col gap-6">
          {Array.from({ length: numQubits }).map((_, qIdx) => (
            <div key={qIdx} className="flex items-center gap-4 relative">
              {/* Qubit label & state */}
              <div className="w-16 flex flex-col font-mono">
                <span className="text-sm font-bold text-cyan-400">q[{qIdx}]</span>
                <span className="text-[10px] text-slate-500">|0⟩</span>
              </div>

              {/* Grid line */}
              <div className="flex-1 relative flex items-center justify-between h-14">
                {/* Horizontal quantum wire */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700" />

                {/* Step grid slots */}
                {Array.from({ length: maxSteps }).map((_, stepIdx) => {
                  const gate = gates.find(g => g.qubit === qIdx && g.step === stepIdx);
                  const isControl = gates.some(g => g.controlQubit === qIdx && g.step === stepIdx);
                  const targetGate = gates.find(g => g.step === stepIdx && g.controlQubit === qIdx);

                  return (
                    <div
                      key={stepIdx}
                      onClick={() => handleCellClick(qIdx, stepIdx)}
                      className={`relative z-10 w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                        activeStep !== undefined && activeStep === stepIdx
                          ? 'ring-2 ring-cyan-400 bg-cyan-950/40'
                          : 'hover:bg-slate-800/80'
                      }`}
                    >
                      {/* Control connection line */}
                      {isControl && targetGate && (
                        <div
                          className="absolute w-0.5 bg-amber-400 z-0"
                          style={{
                            top: targetGate.qubit > qIdx ? '50%' : undefined,
                            bottom: targetGate.qubit < qIdx ? '50%' : undefined,
                            height: `${Math.abs(targetGate.qubit - qIdx) * 80}px`,
                          }}
                        />
                      )}

                      {/* Control dot */}
                      {isControl && (
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-slate-950 z-10 shadow" />
                      )}

                      {/* Gate Box */}
                      {gate && (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs shadow-md border group relative z-10 ${
                          gate.type === 'H' ? 'bg-cyan-900/90 text-cyan-200 border-cyan-500' :
                          gate.type === 'X' ? 'bg-pink-900/90 text-pink-200 border-pink-500' :
                          gate.type === 'Z' ? 'bg-purple-900/90 text-purple-200 border-purple-500' :
                          gate.type === 'CNOT' ? 'bg-amber-900/90 text-amber-200 border-amber-500' :
                          gate.type === 'MEASURE' ? 'bg-emerald-900/90 text-emerald-200 border-emerald-500' :
                          'bg-slate-800 text-slate-200 border-slate-600'
                        }`}>
                          {gate.type === 'CNOT' ? '⊕' : gate.type}
                          <button
                            onClick={(e) => removeGate(gate.id, e)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove gate"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Empty cell placeholder */}
                      {!gate && !isControl && (
                        <div className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-slate-600 transition-colors" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statevector & Measurement Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Complex Statevector & Dirac notation */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Statevector Amplitudes & Phases
            </h4>
            <span className="text-xs font-mono text-cyan-300">
              {activeStep !== undefined ? `After Step ${activeStep}` : 'Final State'}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
            {simulationResult.diracNotation}
          </div>

          {/* Amplitude Bars */}
          <div className="flex flex-col gap-2.5">
            {simulationResult.statevector.map((amp, idx) => {
              const bitstr = idx.toString(2).padStart(numQubits, '0');
              const prob = simulationResult.probabilities[idx];
              const phaseDeg = Math.round((simulationResult.phases[idx] * 180) / Math.PI);

              return (
                <div key={bitstr} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-12 text-slate-300 font-bold">|{bitstr}⟩</span>
                  <div className="flex-1 h-5 bg-slate-950 rounded overflow-hidden border border-slate-800 relative">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 flex items-center px-2"
                      style={{ width: `${Math.max(prob * 100, 1)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-end px-2 text-[10px] text-slate-400 font-bold">
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  <span className="w-16 text-[11px] text-slate-400 text-right">
                    φ: {phaseDeg}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Monte Carlo Measurement Shots */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Measurement Distribution (1024 Simulated Shots)
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Monte-Carlo Sampled</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {Object.entries(simulationResult.measuredShots || {})
              .sort((a, b) => b[1] - a[1])
              .map(([bitstr, count]) => {
                const pct = (count / simulationResult.totalShots) * 100;
                return (
                  <div key={bitstr} className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-12 text-emerald-400 font-bold">|{bitstr}⟩</span>
                    <div className="flex-1 h-5 bg-slate-950 rounded overflow-hidden border border-slate-800 relative">
                      <div
                        className="h-full bg-emerald-500/80 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end px-2 text-[10px] text-slate-300 font-bold">
                        {count} shots ({pct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Individual Qubit Bloch Spheres */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Reduced Density Matrix Bloch Spheres
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {simulationResult.qubitBlochCoords.map((coords, qIdx) => (
            <BlochSphereCanvas
              key={qIdx}
              coords={coords}
              qubitLabel={`Qubit ${qIdx}`}
              size={220}
            />
          ))}
        </div>
      </div>

      {/* Qiskit Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100 font-mono">Qiskit 1.x Python Script</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyQiskitCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950">
              <pre>{qiskitCode}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
