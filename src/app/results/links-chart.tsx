"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  type: {
    label: "type",
  },
  internal: {
    label: "Internal",
    color: "var(--chart-2)",
  },
  external: {
    label: "External",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type ResultsChartProps = {
  data: {
    type: "internal" | "external";
    count: number;
  }[];
};

export function ResultsChart({ data }: ResultsChartProps) {
  return (
    <div className="flex flex-col p-4">
      <h3 className="font-medium">Links Overview</h3>

      <div className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-64"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={data} dataKey="count" nameKey="type" innerRadius={60}>
              {data.map((slice, index) => (
                <Cell
                  key={`${slice.type}-${index}`}
                  fill={chartConfig[slice.type]?.color}
                />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}
