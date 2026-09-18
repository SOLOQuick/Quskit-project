import React, { useState, useRef, useEffect } from 'react';
import { BlochCoords } from '../types';

interface BlochSphereCanvasProps {
  coords: BlochCoords;
  qubitLabel?: string;
  size?: number;
  interactive?: boolean;
  onCoordsChange?: (theta: number, phi: number) => void;
}

export const BlochSphereCanvas: React.FC<BlochSphereCanvasProps> = ({
  coords,
  qubitLabel = 'Qubit 0',
  size = 280,
  interactive = false,
  onCoordsChange,
}) => {
  // View rotation angles (in radians)
  const [viewRotX, setViewRotX] = useState<number>(0.35); // tilt forward
  const [viewRotY, setViewRotY] = useState<number>(0.65); // azimuth
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: 0.35,
    rotY: 0.65,
  });

  const r = size * 0.38; // sphere radius in px
  const cx = size / 2;
  const cy = size / 2;

  // 3D projection function with perspective
  const project3D = (x: number, y: number, z: number): [number, number, number] => {
    // 1. Rotate around Y axis
    const cosY = Math.cos(viewRotY);
    const sinY = Math.sin(viewRotY);
    const x1 = x * cosY + y * sinY;
    const y1 = -x * sinY + y * cosY;
    const z1 = z;

    // 2. Rotate around X axis
    const cosX = Math.cos(viewRotX);
    const sinX = Math.sin(viewRotX);
    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;

    // Projected 2D coordinates (screen X is +x2, screen Y is -z2)
    const px = cx + x2 * r;
    const py = cy - z2 * r;

    return [px, py, y2]; // depth is y2
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: viewRotX,
      rotY: viewRotY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setViewRotY(dragStartRef.current.rotY + dx * 0.01);
    setViewRotX(Math.max(-1.4, Math.min(1.4, dragStartRef.current.rotX + dy * 0.01)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Statevector end point
  const [vecX, vecY] = project3D(coords.x, coords.y, coords.z);

  // Key basis poles projected
  const [p0x, p0y] = project3D(0, 0, 1);    // |0>
  const [p1x, p1y] = project3D(0, 0, -1);   // |1>
  const [ppx, ppy] = project3D(1, 0, 0);    // |+>
  const [pmx, pmy] = project3D(-1, 0, 0);   // |->
  const [piX, piY] = project3D(0, 1, 0);    // |i>

  // Probability of |0> and |1>
  const p0 = Math.cos(coords.theta / 2) ** 2;
  const p1 = Math.sin(coords.theta / 2) ** 2;

  // Generate equator circle points
  const equatorPoints: [number, number][] = [];
  const numCircleSteps = 48;
  for (let i = 0; i <= numCircleSteps; i++) {
    const angle = (i / numCircleSteps) * 2 * Math.PI;
    const [px, py] = project3D(Math.cos(angle), Math.sin(angle), 0);
    equatorPoints.push([px, py]);
  }
  const equatorPath = equatorPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  // Meridian circle (XZ plane)
  const meridianPoints: [number, number][] = [];
  for (let i = 0; i <= numCircleSteps; i++) {
    const angle = (i / numCircleSteps) * 2 * Math.PI;
    const [px, py] = project3D(Math.sin(angle), 0, Math.cos(angle));
    meridianPoints.push([px, py]);
  }
  const meridianPath = meridianPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  return (
    <div className="flex flex-col items-center bg-slate-900/90 border border-cyan-900/50 rounded-xl p-4 shadow-xl text-slate-200">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
          {qubitLabel}
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          θ: {((coords.theta * 180) / Math.PI).toFixed(1)}° | φ: {((coords.phi * 180) / Math.PI).toFixed(1)}°
        </span>
      </div>

      <div
        className="relative cursor-grab active:cursor-grabbing select-none"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <radialGradient id={`sphere-grad-${qubitLabel.replace(/\s+/g, '')}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#0369a1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
            </radialGradient>
            <linearGradient id="vector-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Background sphere glow */}
          <circle cx={cx} cy={cy} r={r} fill={`url(#sphere-grad-${qubitLabel.replace(/\s+/g, '')})`} stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

          {/* Coordinate axes */}
          {/* Z Axis (|0> to |1>) */}
          <line x1={p1x} y1={p1y} x2={p0x} y2={p0y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
          {/* X Axis (|-> to |+>) */}
          <line x1={pmx} y1={pmy} x2={ppx} y2={ppy} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />

          {/* Equator (XY plane) */}
          <path d={equatorPath} fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.35" />

          {/* Meridian (XZ plane) */}
          <path d={meridianPath} fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />

          {/* Basis pole labels */}
          <text x={p0x} y={p0y - 8} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
            |0⟩ (z+)
          </text>
          <text x={p1x} y={p1y + 14} fill="#ec4899" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
            |1⟩ (z-)
          </text>
          <text x={ppx + 10} y={ppy + 3} fill="#94a3b8" fontSize="9" className="font-mono">
            |+⟩ (x)
          </text>
          <text x={piX + 6} y={piY - 4} fill="#94a3b8" fontSize="9" className="font-mono">
            |i⟩ (y)
          </text>

          {/* Statevector arrow */}
          <line
            x1={cx}
            y1={cy}
            x2={vecX}
            y2={vecY}
            stroke="url(#vector-grad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* State vector tip */}
          <circle cx={vecX} cy={vecY} r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />

          {/* Center anchor point */}
          <circle cx={cx} cy={cy} r="2.5" fill="#94a3b8" />
        </svg>

        <div className="absolute bottom-1 right-2 text-[10px] text-slate-500 pointer-events-none">
          Drag to rotate 3D view
        </div>
      </div>

      {/* Probabilities preview */}
      <div className="w-full mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-slate-800/80 border border-sky-950 px-2 py-1.5 rounded flex justify-between items-center">
          <span className="text-sky-400 font-semibold">P(|0⟩):</span>
          <span className="text-slate-200">{(p0 * 100).toFixed(1)}%</span>
        </div>
        <div className="bg-slate-800/80 border border-pink-950 px-2 py-1.5 rounded flex justify-between items-center">
          <span className="text-pink-400 font-semibold">P(|1⟩):</span>
          <span className="text-slate-200">{(p1 * 100).toFixed(1)}%</span>
        </div>
      </div>

      {interactive && onCoordsChange && (
        <div className="w-full mt-3 pt-2 border-t border-slate-800 flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-10">θ:</span>
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.05"
              value={coords.theta}
              onChange={(e) => onCoordsChange(parseFloat(e.target.value), coords.phi)}
              className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-10">φ:</span>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.05"
              value={coords.phi}
              onChange={(e) => onCoordsChange(coords.theta, parseFloat(e.target.value))}
              className="w-full accent-pink-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex gap-1 justify-center mt-1">
            <button
              onClick={() => onCoordsChange(0, 0)}
              className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-sky-300 rounded border border-slate-700"
            >
              |0⟩
            </button>
            <button
              onClick={() => onCoordsChange(Math.PI, 0)}
              className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-pink-300 rounded border border-slate-700"
            >
              |1⟩
            </button>
            <button
              onClick={() => onCoordsChange(Math.PI / 2, 0)}
              className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700"
            >
              |+⟩
            </button>
            <button
              onClick={() => onCoordsChange(Math.PI / 2, Math.PI)}
              className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700"
            >
              |-⟩
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
