"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";


const ease = [0.22, 1, 0.36, 1] as const;

export interface PricingSeriesPoint {
  label: string;
  value: number;
}

function buildAreaPath(values: number[], width: number, height: number, padX: number, padY: number) {
  if (values.length === 0) return { line: "", area: "" };
  const rawMax = Math.max(...values, 0);
  const max = rawMax > 0 ? rawMax : 1;
  const min = rawMax > 0 ? Math.min(...values) * 0.85 : 0;
  const span = max - min || 1;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const pts = values.map((v, i) => {
    const x = padX + (i / Math.max(values.length - 1, 1)) * innerW;
    const y = padY + innerH - ((v - min) / span) * innerH;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const baseY = height - padY;
  const area = `M ${pts[0][0].toFixed(1)} ${baseY.toFixed(1)} ${pts.map((p) => `L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")} L ${pts[pts.length - 1][0].toFixed(1)} ${baseY.toFixed(1)} Z`;
  return { line, area };
}

// 1. Line/Area Chart for Revenue, Demand and Utilization
export function PricingAreaChart({
  points,
  accent = "gold",
  valueFormatter = (n) => n.toString(),
}: {
  points: PricingSeriesPoint[];
  accent?: "gold" | "emerald" | "rose" | "purple";
  valueFormatter?: (n: number) => string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const fillId = `pFill-${uid}`;
  const strokeId = `pStroke-${uid}`;

  const values = points.map((p) => p.value);
  const rawMax = values.length ? Math.max(...values, 0) : 0;
  const max = rawMax > 0 ? rawMax : 0;
  
  const w = 600;
  const h = 180;
  const pad = 20;
  const { line, area } = buildAreaPath(values, w, h, pad, pad);

  // Gradient Config
  const colors: Record<string, { stop: string; stroke: string }> = {
    gold:   { stop: "rgb(201, 168, 76)", stroke: "rgb(232, 201, 109)" },
    emerald: { stop: "rgb(16, 185, 129)", stroke: "rgb(52, 211, 153)" },
    rose:    { stop: "rgb(244, 63, 94)",  stroke: "rgb(251, 113, 133)" },
    purple:  { stop: "rgb(147, 51, 234)", stroke: "rgb(192, 132, 252)" },
  };

  const cfg = colors[accent] || colors.gold;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-[150px] w-full overflow-visible">
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cfg.stop} stopOpacity="0.25" />
            <stop offset="100%" stopColor={cfg.stop} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={cfg.stroke} />
            <stop offset="100%" stopColor={cfg.stop} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={pad}
            y1={pad + (i * (h - pad * 2)) / 2}
            x2={w - pad}
            y2={pad + (i * (h - pad * 2)) / 2}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}

        {/* Fill Area */}
        <motion.path
          d={area}
          fill={`url(#${fillId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease }}
        />

        {/* Stroke Line */}
        <motion.path
          d={line}
          fill="none"
          stroke={`url(#${strokeId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease }}
        />
      </svg>

      <div className="mt-2 flex justify-between text-[10px] font-semibold text-white/40 tracking-wider">
        {points.map((p, i) => (
          <span key={p.label + i} className="shrink-0">
            {p.label}
          </span>
        ))}
      </div>
      <p className="mt-1 text-right text-[10px] text-white/40 font-mono">
        Peak: <span className="text-[#c9a84c] font-bold">{valueFormatter(max)}</span>
      </p>
    </div>
  );
}

// 2. Bar Chart for Season comparison / distribution
export function PricingBarChart({
  points,
  color = "#c9a84c",
}: {
  points: PricingSeriesPoint[];
  color?: string;
}) {
  const rawMax = points.length ? Math.max(...points.map((p) => p.value), 0) : 0;
  if (rawMax === 0) {
    return (
      <div className="flex h-[150px] w-full items-center justify-center rounded-2xl border border-white/[0.04] bg-white/[0.01]">
        <p className="text-xs text-white/35">No data available</p>
      </div>
    );
  }

  const max = rawMax > 0 ? rawMax : 1;
  const w = 500;
  const h = 180;
  const pad = 20;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const barW = innerW / Math.max(points.length, 1) - 6;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-[150px] w-full">
        {points.map((p, i) => {
          const bh = (p.value / max) * innerH;
          const x = pad + (i / Math.max(points.length - 1, 1)) * innerW - barW / 2;
          const y = pad + innerH - bh;
          return (
            <motion.rect
              key={p.label + i}
              x={x}
              y={y}
              width={Math.max(barW, 4)}
              height={Math.max(bh, 0)}
              rx={4}
              fill={color}
              initial={{ height: 0, y: pad + innerH }}
              animate={{ height: Math.max(bh, 0), y }}
              transition={{ duration: 0.5, delay: i * 0.02, ease }}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-semibold text-white/40 tracking-wider">
        {points.map((p, i) => (
          <span key={p.label + i} className="shrink-0 text-center w-8 truncate">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// 3. Horizontal Bars for Vehicle Popularity & Demand scores
export function PricingHorizontalProgress({
  rows,
  valueFormatter = (n) => `${n}`,
}: {
  rows: { label: string; value: number }[];
  valueFormatter?: (n: number) => string;
}) {
  const rawMax = rows.length ? Math.max(...rows.map((r) => r.value), 0) : 0;
  const max = rawMax > 0 ? rawMax : 1;

  return (
    <ul className="space-y-3.5">
      {rows.map((r, i) => (
        <li key={r.label + i} className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate font-semibold text-white/95">{r.label}</span>
            <span className="shrink-0 font-mono text-white/40 text-[10px]">{valueFormatter(r.value)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04] border border-white/[0.02]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#c9a84c] to-[#e8c96d]"
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.min(100, (r.value / max) * 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.04, ease }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
