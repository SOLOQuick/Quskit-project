export type Complex = [number, number]; // [real, imag]

export interface BlochCoords {
  theta: number; // 0 to PI
  phi: number;   // 0 to 2*PI
  x: number;     // sin(theta)*cos(phi)
  y: number;     // sin(theta)*sin(phi)
  z: number;     // cos(theta)
}

export type GateType = 
  | 'H' 
  | 'X' 
  | 'Y' 
  | 'Z' 
  | 'S' 
  | 'T' 
  | 'RX' 
  | 'RY' 
  | 'RZ' 
  | 'CNOT' 
  | 'CZ' 
  | 'SWAP' 
  | 'MEASURE';

export interface Gate {
  id: string;
  type: GateType;
  qubit: number;        // target or primary qubit
  controlQubit?: number;// for 2-qubit gates (CNOT, CZ, SWAP)
  param?: number;       // rotation angle for RX, RY, RZ
  step: number;         // time slice index
}

export interface CircuitState {
  numQubits: number;
  maxSteps: number;
  gates: Gate[];
  activeStep?: number;
}

export interface SimulationResult {
  statevector: Complex[];
  probabilities: number[];
  phases: number[];
  qubitBlochCoords: BlochCoords[];
  measuredShots?: Record<string, number>;
  totalShots: number;
  diracNotation: string;
}

// Disaster relief nodes for QAOA Proof of Concept
export interface DisasterNode {
  id: number;
  name: string;
  type: 'Hospital' | 'Refuge' | 'Logistics' | 'Camp' | 'Clinic';
  urgentNeed: number; // 1 to 10
  survivorCount: number;
  x: number; // graph canvas coordinates
  y: number;
}

export interface DisasterEdge {
  id: string;
  source: number;
  target: number;
  distanceKm: number;
  riskWeight: number; // 1 to 5 (flooded roads, debris)
}

export interface DisasterGraph {
  nodes: DisasterNode[];
  edges: DisasterEdge[];
}

export interface QAOAParameters {
  pLayers: number;     // 1, 2, or 3
  gammas: number[];    // cost angles
  betas: number[];     // mixer angles
  shots: number;
}

export interface QAOARunResult {
  optimalBitstring: string;
  partitionA: number[];
  partitionB: number[];
  expectedCost: number;
  maxPossibleCost: number;
  approximationRatio: number;
  distribution: Record<string, number>;
  convergenceHistory: { step: number; cost: number; gamma: number; beta: number }[];
  classicalCost: number;
  executionTimeMs: number;
}
