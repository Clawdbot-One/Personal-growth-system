import { useState } from "react";
import type { StrengthDimensions } from "@/types";
import { DIMENSION_LABELS, DIMENSION_COLORS } from "@/lib/utils";

interface RadarChartProps {
  dimensions: StrengthDimensions;
  size?: number;
  showLabels?: boolean;
}

/**
 * 四维优势雷达图（纯 SVG 实现）
 */
export function RadarChart({ dimensions, size = 280, showLabels = true }: RadarChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 36;
  const keys = Object.keys(dimensions) as Array<keyof StrengthDimensions>;
  const angles = keys.map((_, i) => (Math.PI * 2 * i) / keys.length - Math.PI / 2);

  const pointAt = (angle: number, r: number) => ({
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  });

  const dataPoints = keys.map((k, i) => {
    const value = dimensions[k];
    const r = (value / 100) * radius;
    return { key: k, value, ...pointAt(angles[i], r) };
  });

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // 同心多边形（4 层）
  const rings = [25, 50, 75, 100].map((pct) =>
    angles.map((a) => pointAt(a, (pct / 100) * radius)).map((p) => `${p.x},${p.y}`).join(" ")
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0.25" />
        </linearGradient>
        <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 同心多边形 */}
      {rings.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#E5E9EE"
          strokeWidth={1}
          className="dark:stroke-ink-700"
        />
      ))}

      {/* 轴线 */}
      {angles.map((a, i) => {
        const p = pointAt(a, radius);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#E5E9EE"
            strokeWidth={1}
            className="dark:stroke-ink-700"
          />
        );
      })}

      {/* 数据多边形 */}
      <polygon
        points={polygonPoints}
        fill="url(#radarFill)"
        stroke="#2563EB"
        strokeWidth={2}
        filter="url(#radarGlow)"
        className="transition-all duration-500"
      />

      {/* 数据点 */}
      {dataPoints.map((p) => (
        <g key={p.key}>
          <circle
            cx={p.x}
            cy={p.y}
            r={hovered === p.key ? 7 : 5}
            fill={DIMENSION_COLORS[p.key]}
            stroke="#fff"
            strokeWidth={2}
            className="transition-all duration-200 cursor-pointer"
            onMouseEnter={() => setHovered(p.key)}
            onMouseLeave={() => setHovered(null)}
          />
          {hovered === p.key && (
            <g>
              <rect
                x={p.x - 32}
                y={p.y - 38}
                width={64}
                height={24}
                rx={6}
                fill="#0B1220"
                opacity={0.9}
              />
              <text
                x={p.x}
                y={p.y - 22}
                textAnchor="middle"
                fill="#fff"
                fontSize={11}
                fontWeight={600}
              >
                {p.value}
              </text>
            </g>
          )}
        </g>
      ))}

      {/* 维度标签 */}
      {showLabels &&
        keys.map((k, i) => {
          const labelPoint = pointAt(angles[i], radius + 20);
          return (
            <text
              key={k}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fontWeight={500}
              fill={DIMENSION_COLORS[k]}
            >
              {DIMENSION_LABELS[k]}
            </text>
          );
        })}
    </svg>
  );
}
