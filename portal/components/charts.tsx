"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  CartesianGrid,
  ZAxis,
} from "recharts";

type Hist = { counts: number[]; edges: number[] };

export function Histogram({ hist, color = "#0d9488" }: { hist: Hist; color?: string }) {
  const data = hist.counts.map((c, i) => ({
    bin: ((hist.edges[i] + hist.edges[i + 1]) / 2).toFixed(2),
    count: c,
  }));
  return (
    <div className="h-56 w-full" role="img" aria-label="Histogram of the metric distribution">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="bin" tick={{ fontSize: 10 }} interval={2} />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            labelFormatter={(l) => `bin center ≈ ${l}`}
          />
          <Bar dataKey="count" fill={color} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScatterPlot({
  points,
  xKey,
  yKey,
  xLabel,
  yLabel,
}: {
  points: Record<string, number>[];
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
}) {
  return (
    <div
      className="h-72 w-full"
      role="img"
      aria-label={`Scatter plot of ${yLabel} against ${xLabel}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 15, bottom: 20, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey={xKey}
            name={xLabel}
            tick={{ fontSize: 10 }}
            label={{ value: xLabel, position: "insideBottom", offset: -8, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey={yKey}
            name={yLabel}
            tick={{ fontSize: 10 }}
            label={{ value: yLabel, angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <ZAxis range={[20, 20]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Scatter data={points} fill="#6366f1" fillOpacity={0.55} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
