import React, { useState } from 'react';
import { BlochSphereCanvas } from './BlochSphereCanvas';
import { BlochCoords, Complex } from '../types';
import { complex, GATES, getRotationGate, apply1QubitGate, computeBlochCoords } from '../lib/quantumEngine';
import { Sparkles, Atom, Split, Shuffle, Play, RefreshCw, Layers, ArrowRight } from 'lucide-react';

export const QuantumFoundationsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'superposition' | 'interference' | 'gates' | 'entanglement'>('superposition');

  // Interactive Superposition state
  const [interactiveTheta, setInteractiveTheta] = useState<number>(Math.PI / 2); // default |+> state
  const [interactivePhi, setInteractivePhi] = useState<number>(0);
  
  // Coin flip experiment state
  const [coinMode, setCoinMode] = useState<'classical' | 'quantum'>('quantum');
  const [coinFlips, setCoinFlips] = useState<{ heads: number; tails: number; total: number }>({ heads: 0, tails: 0, total: 0 });
  const [coinGateCount, setCoinGateCount] = useState<number>(1); // 1 Hadamard = 50/50, 2 Hadamards = 100% heads!

  // Mach-Zehnder Interferometer state
  const [interferometerPhase, setInterferometerPhase] = useState<number>(0); // 0 to 2*PI

  // Gate explorer state
  const [selectedGate, setSelectedGate] = useState<string>('H');
  const [gateInputState, setGateInputState] = useState<'0' | '1' | '+'>('0');

  // Bell state explorer
  const [bellType, setBellType] = useState<'Phi+' | 'Phi-' | 'Psi+' | 'Psi-'>('Phi+');
  const [aliceMeasurement, setAliceMeasurement] = useState<number | null>(null);
  const [bobMeasurement, setBobMeasurement] = useState<number | null>(null);

  // Compute Bloch coordinates for custom superposition
  const currentBloch: BlochCoords = {
    theta: interactiveTheta,
    phi: interactivePhi,
    x: Math.sin(interactiveTheta) * Math.cos(interactivePhi),
    y: Math.sin(interactiveTheta) * Math.sin(interactivePhi),
    z: Math.cos(interactiveTheta),
  };

  const alpha = Math.cos(interactiveTheta / 2);
  const betaMag = Math.sin(interactiveTheta / 2);
  const prob0 = alpha * alpha;
  const prob1 = betaMag * betaMag;

  // Run coin flip simulation
  const runCoinFlips = (numTrials = 100) => {
    let newHeads = 0;
    let newTails = 0;

    for (let i = 0; i < numTrials; i++) {
      if (coinMode === 'classical') {
        // Classical random coin flip
        if (Math.random() > 0.5) newHeads++;
        else newTails++;
      } else {
        // Quantum coin flip: Apply H gates 'coinGateCount' times on initial state |0>
        // H applied an odd number of times yields (|0> + |1>)/√2 -> 50%
        // H applied an even number of times yields H*H = I -> |0> with 100% probability!
        if (coinGateCount % 2 === 1) {
          if (Math.random() > 0.5) newHeads++;
          else newTails++;
        } else {
          newHeads++; // 100% deterministic constructive interference on |0>
        }
      }
    }

    setCoinFlips(prev => ({
      heads: prev.heads + newHeads,
      tails: prev.tails + newTails,
      total: prev.total + numTrials,
    }));
  };

  // Mach-Zehnder detector probabilities
  // P(D0) = cos^2(delta / 2), P(D1) = sin^2(delta / 2)
  const pD0 = Math.cos(interferometerPhase / 2) ** 2;
  const pD1 = Math.sin(interferometerPhase / 2) ** 2;

  // Simulate Bell state measurement
  const triggerAliceMeasurement = () => {
    const outcome = Math.random() < 0.5 ? 0 : 1;
    setAliceMeasurement(outcome);

    // Correlated Bob outcome according to Bell state
    if (bellType === 'Phi+' || bellType === 'Phi-') {
      // Entangled |00> and |11>: Bob always matches Alice
      setBobMeasurement(outcome);
    } else {
      // Entangled |01> and |10>: Bob is always opposite of Alice
      setBobMeasurement(outcome === 0 ? 1 : 0);
    }
  };

  const resetBellTest = () => {
    setAliceMeasurement(null);
    setBobMeasurement(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tabs header */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('superposition')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'superposition'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Atom className="w-4 h-4 text-cyan-400" />
          Qubit & Superposition
        </button>

        <button
          onClick={() => setActiveTab('interference')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'interference'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Split className="w-4 h-4 text-indigo-400" />
          Quantum Interference
        </button>

        <button
          onClick={() => setActiveTab('gates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'gates'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          Quantum Gates & Matrices
        </button>

        <button
          onClick={() => setActiveTab('entanglement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'entanglement'
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-fuchsia-400" />
          Entanglement & Bell Pairs
        </button>
      </div>

      {/* Tab 1: Qubit & Superposition */}
      {activeTab === 'superposition' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Bloch Sphere */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <BlochSphereCanvas
              coords={currentBloch}
              qubitLabel="Interactive Qubit State |ψ⟩"
              interactive={true}
              onCoordsChange={(th, ph) => {
                setInteractiveTheta(th);
                setInteractivePhi(ph);
              }}
            />

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300">
              <div className="text-cyan-400 font-semibold mb-1">State Vector Representation:</div>
              <div className="text-sm bg-slate-950 p-2.5 rounded border border-slate-800 text-cyan-200">
                |ψ⟩ = {alpha.toFixed(3)} |0⟩ + {betaMag.toFixed(3)}
                {interactivePhi !== 0 && `·e^{i${((interactivePhi * 180) / Math.PI).toFixed(0)}°}`} |1⟩
              </div>
              <div className="mt-2 text-slate-400 leading-relaxed">
                Normalization Condition: |α|² + |β|² = {(prob0 + prob1).toFixed(3)} = 1.000.
                Measurement collapses the state into classical bit 0 or 1 with probability proportional to the squared amplitude.
              </div>
            </div>
          </div>

          {/* Right: Concept & Coin Flip Lab */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
                <Atom className="w-5 h-5 text-cyan-400" />
                The Quantum Superposition Principle
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                A classical computer stores data in bits that are strictly either <span className="text-sky-400 font-mono font-bold">0</span> or <span className="text-pink-400 font-mono font-bold">1</span>. 
                In contrast, a <strong>qubit</strong> exists simultaneously as a linear combination (superposition) of both states until an observation forces a physical collapse.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="font-bold text-sky-400 mb-1">State |0⟩</div>
                  <div className="text-slate-400">Pure ground state. Vector points directly to the North Pole (θ=0).</div>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="font-bold text-pink-400 mb-1">State |1⟩</div>
                  <div className="text-slate-400">Excited basis state. Vector points directly to the South Pole (θ=π).</div>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="font-bold text-emerald-400 mb-1">State |+⟩</div>
                  <div className="text-slate-400">Equal superposition (|0⟩+|1⟩)/√2 created via the Hadamard gate.</div>
                </div>
              </div>
            </div>

            {/* Interactive Coin Flip Experiment */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Shuffle className="w-4 h-4 text-cyan-400" />
                    Experiment: Classical Coin Flip vs Quantum Hadamard Coin
                  </h4>
                  <p className="text-xs text-slate-400">
                    Discover why quantum superposition is NOT just classical hidden randomness.
                  </p>
                </div>
                <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => { setCoinMode('classical'); setCoinFlips({ heads: 0, tails: 0, total: 0 }); }}
                    className={`px-3 py-1 rounded transition-colors ${coinMode === 'classical' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'}`}
                  >
                    Classical Coin
                  </button>
                  <button
                    onClick={() => { setCoinMode('quantum'); setCoinFlips({ heads: 0, tails: 0, total: 0 }); }}
                    className={`px-3 py-1 rounded transition-colors ${coinMode === 'quantum' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'}`}
                  >
                    Quantum Hadamard
                  </button>
                </div>
              </div>

              {coinMode === 'quantum' && (
                <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-950 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Gates Applied in Sequence:</span>
                    <button
                      onClick={() => { setCoinGateCount(1); setCoinFlips({ heads: 0, tails: 0, total: 0 }); }}
                      className={`px-2.5 py-1 rounded font-mono ${coinGateCount === 1 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
                    >
                      1 × H (Superposition)
                    </button>
                    <button
                      onClick={() => { setCoinGateCount(2); setCoinFlips({ heads: 0, tails: 0, total: 0 }); }}
                      className={`px-2.5 py-1 rounded font-mono ${coinGateCount === 2 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
                    >
                      2 × H (H · H = Identity)
                    </button>
                  </div>
                  <span className="text-[11px] text-cyan-300">
                    {coinGateCount === 2 ? '100% constructive interference back to |0⟩!' : '50% / 50% superposition.'}
                  </span>
                </div>
              )}

              {/* Action Buttons & Counters */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => runCoinFlips(1)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
                  >
                    <Play className="w-3.5 h-3.5" /> Flip Once
                  </button>
                  <button
                    onClick={() => runCoinFlips(100)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
                  >
                    Flip 100×
                  </button>
                  <button
                    onClick={() => setCoinFlips({ heads: 0, tails: 0, total: 0 })}
                    className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Reset stats"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Total Trials: <span className="text-slate-100 font-bold">{coinFlips.total}</span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-sky-400 font-semibold">
                    |0⟩ (Heads): {coinFlips.heads} ({coinFlips.total > 0 ? ((coinFlips.heads / coinFlips.total) * 100).toFixed(1) : '0.0'}%)
                  </span>
                  <span className="text-pink-400 font-semibold">
                    |1⟩ (Tails): {coinFlips.tails} ({coinFlips.total > 0 ? ((coinFlips.tails / coinFlips.total) * 100).toFixed(1) : '0.0'}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    className="bg-sky-500 transition-all duration-300"
                    style={{ width: `${coinFlips.total > 0 ? (coinFlips.heads / coinFlips.total) * 100 : 50}%` }}
                  />
                  <div
                    className="bg-pink-500 transition-all duration-300"
                    style={{ width: `${coinFlips.total > 0 ? (coinFlips.tails / coinFlips.total) * 100 : 50}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-400 italic bg-slate-950/50 p-2.5 rounded border border-slate-800">
                {coinMode === 'classical' ? (
                  "In a classical coin toss, flipping twice simply produces another independent 50/50 toss."
                ) : coinGateCount === 2 ? (
                  "Notice the quantum phenomenon: Flipping a quantum coin twice (H · H) produces 100% Heads (|0⟩)! The probability amplitudes of |1⟩ cancel out through destructive interference, which is impossible in classical probability."
                ) : (
                  "Applying a single Hadamard gate places the qubit in equal superposition with positive amplitudes."
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quantum Interference */}
      {activeTab === 'interference' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
                <Split className="w-5 h-5 text-indigo-400" />
                Mach-Zehnder Interferometer Simulation
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Quantum computing achieves computational speedups not by brute force, but by orchestrating 
                <strong> constructive interference</strong> to amplify correct answers and <strong>destructive interference</strong> to cancel out incorrect ones.
              </p>

              {/* Visual Interferometer Circuit Diagram */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
                <svg viewBox="0 0 520 180" className="w-full max-w-lg overflow-visible">
                  {/* Laser emitter */}
                  <rect x="10" y="70" width="40" height="24" rx="4" fill="#0284c7" />
                  <text x="30" y="86" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">Photon</text>

                  {/* Beam path to BS1 */}
                  <line x1="50" y1="82" x2="100" y2="82" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />

                  {/* Beam Splitter 1 (Hadamard 1) */}
                  <line x1="90" y1="62" x2="110" y2="102" stroke="#a855f7" strokeWidth="4" />
                  <text x="100" y="52" fill="#c084fc" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">BS1 (H)</text>

                  {/* Upper path (reflected) */}
                  <line x1="100" y1="82" x2="180" y2="25" stroke="#38bdf8" strokeWidth="1.5" />
                  <rect x="180" y="15" width="20" height="20" fill="#475569" transform="rotate(45 190 25)" />
                  <text x="190" y="10" fill="#94a3b8" fontSize="9" textAnchor="middle">Mirror</text>
                  <line x1="190" y1="25" x2="330" y2="25" stroke="#38bdf8" strokeWidth="1.5" />

                  {/* Lower path (transmitted through Phase Shifter) */}
                  <line x1="100" y1="82" x2="180" y2="140" stroke="#ec4899" strokeWidth="1.5" />
                  <rect x="180" y="130" width="20" height="20" fill="#475569" transform="rotate(45 190 140)" />
                  <text x="190" y="165" fill="#94a3b8" fontSize="9" textAnchor="middle">Mirror</text>

                  {/* Phase Shifter */}
                  <line x1="190" y1="140" x2="230" y2="140" stroke="#ec4899" strokeWidth="1.5" />
                  <rect x="230" y="125" width="46" height="30" rx="6" fill="#f43f5e" stroke="#fb7185" strokeWidth="1.5" />
                  <text x="253" y="144" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">
                    e^(iδ)
                  </text>
                  <line x1="276" y1="140" x2="330" y2="140" stroke="#ec4899" strokeWidth="1.5" />

                  {/* Beam Splitter 2 (Hadamard 2) */}
                  <line x1="330" y1="25" x2="370" y2="82" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="330" y1="140" x2="370" y2="82" stroke="#ec4899" strokeWidth="1.5" />
                  <line x1="360" y1="62" x2="380" y2="102" stroke="#a855f7" strokeWidth="4" />
                  <text x="370" y="52" fill="#c084fc" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">BS2 (H)</text>

                  {/* Paths to Detectors */}
                  <line x1="370" y1="82" x2="440" y2="50" stroke="#38bdf8" strokeWidth="2" />
                  <rect x="440" y="38" width="55" height="24" rx="4" fill={pD0 > 0.5 ? "#0284c7" : "#1e293b"} stroke="#38bdf8" strokeWidth="1" />
                  <text x="467" y="54" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">Det 0</text>

                  <line x1="370" y1="82" x2="440" y2="114" stroke="#ec4899" strokeWidth="2" />
                  <rect x="440" y="102" width="55" height="24" rx="4" fill={pD1 > 0.5 ? "#db2777" : "#1e293b"} stroke="#ec4899" strokeWidth="1" />
                  <text x="467" y="118" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">Det 1</text>
                </svg>

                {/* Phase Control Slider */}
                <div className="w-full mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Phase Shift Angle (δ):</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {((interferometerPhase * 180) / Math.PI).toFixed(0)}° ({(interferometerPhase / Math.PI).toFixed(2)}π)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={2 * Math.PI}
                    step="0.05"
                    value={interferometerPhase}
                    onChange={(e) => setInterferometerPhase(parseFloat(e.target.value))}
                    className="w-full accent-indigo-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0 (Constructive D0)</span>
                    <span>π/2 (50% / 50%)</span>
                    <span>π (Destructive D0 / 100% D1)</span>
                    <span>2π (Constructive D0)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Detector Probabilities & Math */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Detector Probability Output
              </h4>

              <div className="flex flex-col gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-sky-400 font-semibold">Detector 0 (Ground State |0⟩):</span>
                    <span className="text-slate-200">{(pD0 * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 transition-all duration-150" style={{ width: `${pD0 * 100}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 font-mono">P(D0) = cos²(δ/2)</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-pink-400 font-semibold">Detector 1 (Excited State |1⟩):</span>
                    <span className="text-slate-200">{(pD1 * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 transition-all duration-150" style={{ width: `${pD1 * 100}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 font-mono">P(D1) = sin²(δ/2)</div>
                </div>
              </div>

              <div className="bg-indigo-950/30 border border-indigo-900/50 p-3.5 rounded-lg text-xs text-indigo-200 leading-relaxed">
                <div className="font-bold text-indigo-300 mb-1">Mathematical Mechanism:</div>
                When δ = 0, both paths arrive in phase at Detector 0 (+1/2 + +1/2 = 1), causing complete <strong>constructive interference</strong>. 
                Simultaneously, at Detector 1, the amplitudes are out of phase (+1/2 - 1/2 = 0), completely eliminating probability through <strong>destructive interference</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Quantum Gates & Matrices */}
      {activeTab === 'gates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gate Selector */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Available Quantum Gates</h4>
            <div className="grid grid-cols-3 gap-2">
              {['H', 'X', 'Y', 'Z', 'S', 'T', 'RX', 'RZ', 'CNOT'].map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGate(g)}
                  className={`py-2.5 px-3 rounded-lg font-mono font-bold text-sm transition-all border ${
                    selectedGate === g
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-md'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {g} Gate
                </button>
              ))}
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mt-2 text-xs">
              <span className="text-slate-400 font-semibold block mb-2">Test Input State:</span>
              <div className="flex gap-2">
                {(['0', '1', '+'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setGateInputState(st)}
                    className={`flex-1 py-1.5 rounded font-mono font-semibold transition-all ${
                      gateInputState === st
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    |{st}⟩
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gate Details & Matrix */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-100 font-mono flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg">
                    {selectedGate}
                  </span>
                  {selectedGate === 'H' && 'Hadamard Superposition Gate'}
                  {selectedGate === 'X' && 'Pauli-X (Quantum NOT / Bit-Flip)'}
                  {selectedGate === 'Y' && 'Pauli-Y (Bit & Phase Flip)'}
                  {selectedGate === 'Z' && 'Pauli-Z (Phase Flip)'}
                  {selectedGate === 'S' && 'Phase S Gate (π/2 Rotation)'}
                  {selectedGate === 'T' && 'T Gate (π/4 Non-Clifford Rotation)'}
                  {selectedGate === 'RX' && 'RX(θ) Transverse Mixer Rotation'}
                  {selectedGate === 'RZ' && 'RZ(θ) Longitudinal Phase Rotation'}
                  {selectedGate === 'CNOT' && 'Controlled-NOT (Entangling Gate)'}
                </h3>
              </div>

              {/* Matrix Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs font-mono">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-amber-400 font-semibold mb-2">Unitary Matrix U:</div>
                  {selectedGate === 'H' && (
                    <div className="text-slate-200">
                      1/√2 · [ [ 1,  1 ],<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ 1, -1 ] ]
                    </div>
                  )}
                  {selectedGate === 'X' && (
                    <div className="text-slate-200">
                      [ [ 0, 1 ],<br />
                      &nbsp;&nbsp;[ 1, 0 ] ]
                    </div>
                  )}
                  {selectedGate === 'Y' && (
                    <div className="text-slate-200">
                      [ [ 0, -i ],<br />
                      &nbsp;&nbsp;[ i,  0 ] ]
                    </div>
                  )}
                  {selectedGate === 'Z' && (
                    <div className="text-slate-200">
                      [ [ 1,  0 ],<br />
                      &nbsp;&nbsp;[ 0, -1 ] ]
                    </div>
                  )}
                  {selectedGate === 'S' && (
                    <div className="text-slate-200">
                      [ [ 1, 0 ],<br />
                      &nbsp;&nbsp;[ 0, i ] ]
                    </div>
                  )}
                  {selectedGate === 'T' && (
                    <div className="text-slate-200">
                      [ [ 1, 0 ],<br />
                      &nbsp;&nbsp;[ 0, e^(iπ/4) ] ]
                    </div>
                  )}
                  {selectedGate === 'RX' && (
                    <div className="text-slate-200">
                      [ [ cos(θ/2), -i·sin(θ/2) ],<br />
                      &nbsp;&nbsp;[ -i·sin(θ/2), cos(θ/2) ] ]
                    </div>
                  )}
                  {selectedGate === 'RZ' && (
                    <div className="text-slate-200">
                      [ [ e^(-iθ/2), 0 ],<br />
                      &nbsp;&nbsp;[ 0, e^(iθ/2) ] ]
                    </div>
                  )}
                  {selectedGate === 'CNOT' && (
                    <div className="text-slate-200">
                      [ [ 1, 0, 0, 0 ],<br />
                      &nbsp;&nbsp;[ 0, 1, 0, 0 ],<br />
                      &nbsp;&nbsp;[ 0, 0, 0, 1 ],<br />
                      &nbsp;&nbsp;[ 0, 0, 1, 0 ] ]
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-semibold mb-2">Basis Transitions:</div>
                  {selectedGate === 'H' && (
                    <div className="text-slate-300">
                      |0⟩ ➔ (|0⟩ + |1⟩)/√2 = |+⟩<br />
                      |1⟩ ➔ (|0⟩ - |1⟩)/√2 = |-⟩
                    </div>
                  )}
                  {selectedGate === 'X' && (
                    <div className="text-slate-300">
                      |0⟩ ➔ |1⟩<br />
                      |1⟩ ➔ |0⟩
                    </div>
                  )}
                  {selectedGate === 'Z' && (
                    <div className="text-slate-300">
                      |0⟩ ➔ |0⟩<br />
                      |1⟩ ➔ -|1⟩ (Phase Inversion)
                    </div>
                  )}
                  {selectedGate === 'CNOT' && (
                    <div className="text-slate-300">
                      |00⟩ ➔ |00⟩, |01⟩ ➔ |01⟩<br />
                      |10⟩ ➔ |11⟩, |11⟩ ➔ |10⟩
                    </div>
                  )}
                  {selectedGate !== 'H' && selectedGate !== 'X' && selectedGate !== 'Z' && selectedGate !== 'CNOT' && (
                    <div className="text-slate-300">
                      Applies a continuous rotation on the Bloch sphere along the specified axis.
                    </div>
                  )}
                </div>
              </div>

              {/* Qiskit 1.x Code Snippet */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                <div className="text-emerald-400 font-semibold mb-1">Qiskit 1.x Syntax:</div>
                <pre className="text-slate-300">
                  {selectedGate === 'H' && `from qiskit import QuantumCircuit\nqc = QuantumCircuit(1)\nqc.h(0)  # Apply Hadamard to Qubit 0`}
                  {selectedGate === 'X' && `qc.x(0)  # Apply Pauli-X to Qubit 0`}
                  {selectedGate === 'Y' && `qc.y(0)  # Apply Pauli-Y to Qubit 0`}
                  {selectedGate === 'Z' && `qc.z(0)  # Apply Pauli-Z to Qubit 0`}
                  {selectedGate === 'S' && `qc.s(0)  # Apply Phase S gate to Qubit 0`}
                  {selectedGate === 'T' && `qc.t(0)  # Apply T gate to Qubit 0`}
                  {selectedGate === 'RX' && `import numpy as np\nqc.rx(np.pi/2, 0)  # Rotate Qubit 0 by π/2 around X axis`}
                  {selectedGate === 'RZ' && `import numpy as np\nqc.rz(np.pi/4, 0)  # Rotate Qubit 0 by π/4 around Z axis`}
                  {selectedGate === 'CNOT' && `qc.cx(control_qubit=0, target_qubit=1)  # Two-qubit entangling gate`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Entanglement & Bell Pairs */}
      {activeTab === 'entanglement' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                Quantum Entanglement & The Bell States
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Entanglement is a purely quantum phenomenon where two or more particles become inextricably linked. 
                The composite quantum state cannot be factored into the product of individual states: 
                <span className="font-mono text-fuchsia-300"> |ψ_AB⟩ ≠ |ψ_A⟩ ⊗ |ψ_B⟩</span>.
              </p>

              {/* Bell State Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { id: 'Phi+', formula: '(|00⟩ + |11⟩)/√2', label: 'Bell State |Φ⁺⟩' },
                  { id: 'Phi-', formula: '(|00⟩ - |11⟩)/√2', label: 'Bell State |Φ⁻⟩' },
                  { id: 'Psi+', formula: '(|01⟩ + |10⟩)/√2', label: 'Bell State |Ψ⁺⟩' },
                  { id: 'Psi-', formula: '(|01⟩ - |10⟩)/√2', label: 'Bell State |Ψ⁻⟩' },
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setBellType(b.id as any); resetBellTest(); }}
                    className={`p-3 rounded-lg text-left transition-all border ${
                      bellType === b.id
                        ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/60 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">{b.id}</div>
                    <div className="text-[11px] font-mono text-slate-300 mt-1">{b.formula}</div>
                  </button>
                ))}
              </div>

              {/* Circuit Generation for Bell State */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="text-slate-400 font-semibold mb-2">Entanglement Circuit:</div>
                <div className="text-slate-200">
                  Qubit 0 (Alice): ──[ H ]──■── [Measure] ➔ Output A<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
                  Qubit 1 (Bob)&nbsp;&nbsp;: ─────────[X]── [Measure] ➔ Output B
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Spooky Action Measurement */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Atom className="w-4 h-4 text-fuchsia-400" />
                EPR Paradox: Non-Local Correlation Test
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Measuring Alice's qubit instantly forces Bob's qubit to collapse, even if they were separated by light-years across the universe.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-sky-900/50 flex flex-col items-center">
                  <span className="text-xs font-mono text-sky-400 font-bold mb-1">Alice's Qubit</span>
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-sky-500/40 flex items-center justify-center my-2 text-2xl font-mono font-bold text-sky-300">
                    {aliceMeasurement !== null ? `|${aliceMeasurement}⟩` : '?'}
                  </div>
                  <span className="text-[10px] text-slate-500">Separated at Lab 1</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-pink-900/50 flex flex-col items-center">
                  <span className="text-xs font-mono text-pink-400 font-bold mb-1">Bob's Qubit</span>
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-pink-500/40 flex items-center justify-center my-2 text-2xl font-mono font-bold text-pink-300">
                    {bobMeasurement !== null ? `|${bobMeasurement}⟩` : '?'}
                  </div>
                  <span className="text-[10px] text-slate-500">Separated at Lab 2</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={triggerAliceMeasurement}
                  className="flex-1 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" /> Measure Alice's Qubit
                </button>
                <button
                  onClick={resetBellTest}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {aliceMeasurement !== null && (
                <div className="p-3 bg-fuchsia-950/40 border border-fuchsia-800/50 rounded-lg text-xs text-fuchsia-200">
                  <strong>Measurement Result:</strong> Alice measured <span className="font-mono font-bold text-sky-300">|{aliceMeasurement}⟩</span>. 
                  Bob's state collapsed to <span className="font-mono font-bold text-pink-300">|{bobMeasurement}⟩</span> with 100% correlation.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
