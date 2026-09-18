import { DisasterGraph, Gate } from '../types';

export const DISASTER_SCENARIOS: Record<string, DisasterGraph> = {
  coastal_cyclone: {
    nodes: [
      { id: 0, name: 'St. Jude Regional Hospital', type: 'Hospital', urgentNeed: 9, survivorCount: 420, x: 80, y: 70 },
      { id: 1, name: 'Coastal Fishermen Refuge', type: 'Refuge', urgentNeed: 8, survivorCount: 310, x: 280, y: 50 },
      { id: 2, name: 'Inland High School Camp', type: 'Camp', urgentNeed: 6, survivorCount: 550, x: 230, y: 220 },
      { id: 3, name: 'Central Logistics Depot', type: 'Logistics', urgentNeed: 3, survivorCount: 40, x: 60, y: 230 },
      { id: 4, name: 'Hillside Mobile Clinic', type: 'Clinic', urgentNeed: 7, survivorCount: 190, x: 370, y: 150 },
    ],
    edges: [
      { id: 'e01', source: 0, target: 1, distanceKm: 14.5, riskWeight: 4.5 }, // Severely flooded coastline
      { id: 'e02', source: 0, target: 2, distanceKm: 8.2, riskWeight: 1.8 },
      { id: 'e03', source: 0, target: 3, distanceKm: 6.0, riskWeight: 1.2 },
      { id: 'e12', source: 1, target: 2, distanceKm: 12.0, riskWeight: 3.8 },
      { id: 'e14', source: 1, target: 4, distanceKm: 10.4, riskWeight: 4.0 }, // Washed out bridge
      { id: 'e23', source: 2, target: 3, distanceKm: 7.5, riskWeight: 1.5 },
      { id: 'e24', source: 2, target: 4, distanceKm: 9.1, riskWeight: 2.2 },
    ]
  },
  earthquake_zone: {
    nodes: [
      { id: 0, name: 'Downtown Trauma Center', type: 'Hospital', urgentNeed: 10, survivorCount: 600, x: 90, y: 80 },
      { id: 1, name: 'Eastside Evacuation Park', type: 'Camp', urgentNeed: 7, survivorCount: 450, x: 300, y: 70 },
      { id: 2, name: 'Valley Water Treatment Hub', type: 'Logistics', urgentNeed: 5, survivorCount: 80, x: 120, y: 230 },
      { id: 3, name: 'Suburban Field Clinic', type: 'Clinic', urgentNeed: 8, survivorCount: 220, x: 320, y: 220 },
    ],
    edges: [
      { id: 'eq01', source: 0, target: 1, distanceKm: 11.2, riskWeight: 4.8 }, // Collapsed overpass
      { id: 'eq02', source: 0, target: 2, distanceKm: 7.0, riskWeight: 2.5 },
      { id: 'eq13', source: 1, target: 3, distanceKm: 6.8, riskWeight: 3.2 },
      { id: 'eq23', source: 2, target: 3, distanceKm: 9.4, riskWeight: 1.9 },
    ]
  }
};

export interface CircuitPreset {
  id: string;
  name: string;
  description: string;
  numQubits: number;
  gates: Gate[];
}

export const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    id: 'bell_state',
    name: 'Bell State (|Φ⁺⟩)',
    description: 'Creates maximum entanglement between 2 qubits: (|00⟩ + |11⟩)/√2.',
    numQubits: 2,
    gates: [
      { id: 'g1', type: 'H', qubit: 0, step: 0 },
      { id: 'g2', type: 'CNOT', qubit: 1, controlQubit: 0, step: 1 },
      { id: 'g3', type: 'MEASURE', qubit: 0, step: 2 },
      { id: 'g4', type: 'MEASURE', qubit: 1, step: 2 },
    ]
  },
  {
    id: 'ghz_state',
    name: '3-Qubit GHZ State',
    description: 'Greenberger-Horne-Zeilinger state: (|000⟩ + |111⟩)/√2.',
    numQubits: 3,
    gates: [
      { id: 'g1', type: 'H', qubit: 0, step: 0 },
      { id: 'g2', type: 'CNOT', qubit: 1, controlQubit: 0, step: 1 },
      { id: 'g3', type: 'CNOT', qubit: 2, controlQubit: 1, step: 2 },
      { id: 'g4', type: 'MEASURE', qubit: 0, step: 3 },
      { id: 'g5', type: 'MEASURE', qubit: 1, step: 3 },
      { id: 'g6', type: 'MEASURE', qubit: 2, step: 3 },
    ]
  },
  {
    id: 'grover_2q',
    name: "Grover's Search (Target |11⟩)",
    description: 'Quantum search finding marked item |11⟩ in 4 database elements with 100% probability.',
    numQubits: 2,
    gates: [
      // 1. Equal superposition
      { id: 'g1', type: 'H', qubit: 0, step: 0 },
      { id: 'g2', type: 'H', qubit: 1, step: 0 },
      // 2. Oracle marking |11>: CZ gate
      { id: 'g3', type: 'CZ', qubit: 1, controlQubit: 0, step: 1 },
      // 3. Diffusion operator (Inversion about mean)
      { id: 'g4', type: 'H', qubit: 0, step: 2 },
      { id: 'g5', type: 'H', qubit: 1, step: 2 },
      { id: 'g6', type: 'X', qubit: 0, step: 3 },
      { id: 'g7', type: 'X', qubit: 1, step: 3 },
      { id: 'g8', type: 'CZ', qubit: 1, controlQubit: 0, step: 4 },
      { id: 'g9', type: 'X', qubit: 0, step: 5 },
      { id: 'g10', type: 'X', qubit: 1, step: 5 },
      { id: 'g11', type: 'H', qubit: 0, step: 6 },
      { id: 'g12', type: 'H', qubit: 1, step: 6 },
      { id: 'g13', type: 'MEASURE', qubit: 0, step: 7 },
      { id: 'g14', type: 'MEASURE', qubit: 1, step: 7 },
    ]
  },
  {
    id: 'superdense_coding',
    name: 'Superdense Coding Protocol',
    description: 'Transmits 2 classical bits of information using just 1 transmitted entangled qubit.',
    numQubits: 2,
    gates: [
      { id: 'g1', type: 'H', qubit: 0, step: 0 },
      { id: 'g2', type: 'CNOT', qubit: 1, controlQubit: 0, step: 1 },
      // Alice encodes message "11" by applying X and Z to Q0
      { id: 'g3', type: 'X', qubit: 0, step: 2 },
      { id: 'g4', type: 'Z', qubit: 0, step: 3 },
      // Bob decodes in Bell basis
      { id: 'g5', type: 'CNOT', qubit: 1, controlQubit: 0, step: 4 },
      { id: 'g6', type: 'H', qubit: 0, step: 5 },
      { id: 'g7', type: 'MEASURE', qubit: 0, step: 6 },
      { id: 'g8', type: 'MEASURE', qubit: 1, step: 6 },
    ]
  }
];
