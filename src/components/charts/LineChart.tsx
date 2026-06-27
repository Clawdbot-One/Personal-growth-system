import { useId } from "react";

interface Point {
  label: string;
  value: number;
}

interface LineChartProps {
  data: Point[];
  height?: number;
  color?: string;
  fillColor?: string;
  yMax?: number;
  yMin?: number;
  showDots?: boolean;
  showAxis?: boolean;
  className?: string;
}

/**
 * 简易折线图（纯 SVG）
 */
export function LineChart({
  data,
  height = 160,
  color = "#2563EB",
  fillColor = "rgba(37, 99, 235, 0.12)",
  yMax,
  yMin = 0,
  showDots = true,
  showAxis = true,
  className,
}: LineChartProps) {
  const gradientId = useId();
  const width = 320; // viewBox 宽度，实际通过 CSS 拉伸
  const padding = { top: 12, right: 12, bottom: 24, left: 12 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const maxV = yMax ?? Math.max(...values, 1);
  const minV = yMin;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = padding.top + (1 - (d.value - minV) / (maxV - minV)) * innerH;
    return { x, y, ...d };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const fillD = `${pathD} L ${points[points.length - 1]?.x ?? 0} ${padding.top + innerH} L ${padding.left} ${padding.top + innerH} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className ?? ""}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y 轴网格线 */}
      {showAxis &&
        [0, 0.5, 1].map((t, i) => {
          const y = padding.top + t * innerH;
          return (
            <line
              key={i}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="#E5E9EE"
              strokeWidth={1}
              strokeDasharray={i === 1 ? "4 4" : undefined}
              className="dark:stroke-ink-700"
            />
          );
        })}

      {/* 填充区域 */}
      <path d={fillD} fill={`url(#${gradientId})`} />

      {/* 折线 */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* 数据点 */}
      {showDots &&
        points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#fff" stroke={color} strokeWidth={2} />
        ))}

      {/* X 轴标签 */}
      {showAxis &&
        points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            fontSize={10}
            fill="#94A3B8"
          >
            {p.label}
          </text>
        ))}
    </svg>
  );
}
