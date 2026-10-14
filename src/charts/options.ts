import type { EChartsCoreOption } from "echarts/core";
import type { AllocationRow, CompanyBar, DashboardData, Gauge } from "../../server/dashboardData";
import { CHART_FONT, TARGET_SYMBOL } from "./font";

const tooltip = {
  backgroundColor: "#f9f9f9",
  borderColor: "#322f30",
  borderWidth: 1,
  padding: [8, 12],
  textStyle: { color: "#25262d", fontFamily: CHART_FONT, fontSize: 12 },
  extraCssText:
    "border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.2);",
};

export function ticketOption(data: DashboardData["ticket"]): EChartsCoreOption {
  const counts = Object.fromEntries(data.segments.map((segment) => [segment.name, segment.count]));
  // ~1.5px at typical chart width (~520px over a 5000-unit axis)
  const separator = 15;
  const lastIndex = data.segments.length - 1;
  const stacked = data.segments.flatMap((segment, index) => {
    const bars: Record<string, unknown>[] = [
      {
        type: "bar",
        name: segment.name,
        stack: "sections",
        barWidth: 12,
        itemStyle: {
          color: segment.color,
          borderRadius: index === 0 ? [6, 0, 0, 6] : index === lastIndex ? [0, 6, 6, 0] : 0,
        },
        label: { show: false },
        data: [segment.share],
        tooltip: {
          formatter: () => `${segment.name}: ${counts[segment.name] ?? segment.share}`,
        },
      },
    ];
    if (index < lastIndex) {
      bars.push({
        type: "bar",
        name: "separator",
        stack: "sections",
        barWidth: 12,
        silent: true,
        itemStyle: { color: "#000000" },
        data: [separator],
        tooltip: { show: false },
      });
    }
    return bars;
  });

  return {
    backgroundColor: "transparent",
    textStyle: { fontFamily: CHART_FONT },
    animationDuration: 600,
    grid: { left: 0, right: 28, top: 8, bottom: 8, containLabel: false },
    tooltip: { ...tooltip, trigger: "item" },
    xAxis: { type: "value", min: 0, max: data.target, show: false },
    yAxis: { type: "category", data: ["registration"], show: false },
    series: [
      {
        type: "bar",
        name: "Target track",
        barWidth: 12,
        barGap: "-100%",
        silent: true,
        itemStyle: { color: data.track, borderRadius: 6 },
        data: [data.target],
      },
      ...stacked,
      {
        type: "scatter",
        name: "Target",
        symbol: TARGET_SYMBOL,
        symbolKeepAspect: true,
        symbolSize: [8, 22],
        itemStyle: { color: "#ffffff" },
        data: [[data.target, "registration"]],
        tooltip: { formatter: () => `Target: ${data.target}` },
      },
    ],
  };
}

export function companyOption(companies: CompanyBar[]): EChartsCoreOption {
  return {
    backgroundColor: "transparent",
    textStyle: { fontFamily: CHART_FONT },
    animationDuration: 600,
    grid: { left: 4, right: 48, top: 8, bottom: 28, containLabel: true },
    tooltip: { ...tooltip, trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: {
      type: "value",
      max: 600,
      axisLine: { lineStyle: { color: "#5e5e5e" } },
      axisTick: { lineStyle: { color: "#5e5e5e" } },
      axisLabel: { color: "#c6c6cf", fontFamily: CHART_FONT, fontSize: 12 },
      splitLine: { lineStyle: { color: "#322f30" } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: companies.map((company) => company.name),
      axisLine: { lineStyle: { color: "#5e5e5e" } },
      axisTick: { show: false },
      axisLabel: { color: "#ffffff", fontFamily: CHART_FONT, fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        name: "Attendees",
        barMaxWidth: 18,
        label: {
          show: true,
          position: "right",
          color: "#c6c6cf",
          fontFamily: CHART_FONT,
          fontSize: 12,
          fontWeight: 600,
        },
        data: companies.map((company) => ({
          value: company.value,
          itemStyle: { color: company.color, borderRadius: [0, 12, 12, 0] },
        })),
      },
    ],
  };
}

export function allocationOption(rows: AllocationRow[]): EChartsCoreOption {
  const max = Math.max(...rows.map((row) => Math.max(row.maximum, row.target, row.value)), 1);
  return {
    backgroundColor: "transparent",
    textStyle: { fontFamily: CHART_FONT },
    animationDuration: 600,
    grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
    tooltip: {
      ...tooltip,
      trigger: "axis",
      axisPointer: { type: "none" },
      formatter: (params: unknown) => {
        const items = Array.isArray(params) ? params : [params];
        const first = items[0] as { dataIndex?: number } | undefined;
        const index = first?.dataIndex ?? 0;
        const row = rows[index];
        if (!row) return "";
        const pct = row.target > 0 ? Math.round((row.value / row.target) * 100) : 0;
        return [
          `<div style="font-weight:700;margin-bottom:4px">${row.group}</div>`,
          `Target: ${row.target}`,
          `Currently registered: ${row.value}`,
          `Percentage of target: ${pct}%`,
        ].join("<br/>");
      },
    },
    xAxis: { type: "value", min: 0, max: max * 1.08, show: false },
    yAxis: {
      type: "category",
      inverse: true,
      data: rows.map((_, index) => String(index)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#ffffff",
        fontFamily: CHART_FONT,
        fontSize: 12,
        align: "right",
        margin: 12,
        formatter: (value: string) => {
          const row = rows[Number(value)];
          if (!row) return value;
          const clip = (text: string, max: number) =>
            text.length > max ? `${text.slice(0, max - 1)}…` : text;
          return `{label|${clip(row.group, 24)}}\n{note|${clip(row.owner, 26)}}`;
        },
        rich: {
          label: {
            fontFamily: CHART_FONT,
            fontWeight: 700,
            fontSize: 12,
            color: "#ffffff",
            align: "right",
            lineHeight: 16,
            width: 148,
            overflow: "truncate",
            ellipsis: "…",
          },
          note: {
            fontFamily: CHART_FONT,
            fontWeight: 400,
            fontSize: 11,
            color: "#aaaab4",
            align: "right",
            lineHeight: 14,
            width: 148,
            overflow: "truncate",
            ellipsis: "…",
          },
        },
      },
    },
    series: [
      {
        type: "bar",
        name: "Maximum",
        barWidth: 14,
        barGap: "-100%",
        silent: true,
        itemStyle: { color: "#3a3548", borderRadius: 7 },
        data: rows.map((row) => row.maximum),
      },
      {
        type: "bar",
        name: "Registered",
        barWidth: 14,
        barGap: "-100%",
        itemStyle: { borderRadius: 7 },
        label: {
          show: true,
          position: "right",
          color: "#c6c6cf",
          fontFamily: CHART_FONT,
          fontSize: 12,
          fontWeight: 600,
        },
        data: rows.map((row) => ({ value: row.value, itemStyle: { color: row.color, borderRadius: 7 } })),
      },
      {
        type: "scatter",
        name: "Target",
        symbol: TARGET_SYMBOL,
        symbolKeepAspect: true,
        symbolSize: [6, 22],
        itemStyle: { color: "#ffffff" },
        data: rows.map((row, index) => [row.target, String(index)]),
      },
    ],
  };
}

export function gaugeOption(gauge: Gauge): EChartsCoreOption {
  return {
    backgroundColor: "transparent",
    textStyle: { fontFamily: CHART_FONT },
    animationDuration: 600,
    series: [
      {
        type: "gauge",
        center: ["50%", "52%"],
        radius: "78%",
        min: 0,
        max: 100,
        startAngle: 210,
        endAngle: -30,
        progress: {
          show: true,
          width: 12,
          roundCap: true,
          itemStyle: { color: gauge.color },
        },
        axisLine: { roundCap: true, lineStyle: { width: 12, color: [[1, "#322f30"]] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        title: {
          color: "#c6c6cf",
          fontFamily: CHART_FONT,
          fontSize: 12,
          offsetCenter: [0, "78%"],
        },
        detail: {
          color: "#ffffff",
          fontFamily: CHART_FONT,
          fontWeight: 700,
          fontSize: 20,
          offsetCenter: [0, "8%"],
          formatter: "{value}%",
        },
        data: [{ value: gauge.percent, name: gauge.caption ?? "Registered" }],
      },
    ],
  };
}
