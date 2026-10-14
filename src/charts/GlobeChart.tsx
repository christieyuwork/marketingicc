import * as echarts from "echarts";
import "echarts-gl";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import type { CountryRegistration } from "../../server/dashboardData";
import { CHART_FONT } from "./font";

type GlobeChartProps = {
  countries: CountryRegistration[];
  label: string;
  expanded?: boolean;
};

type TipState = {
  text: string;
  x: number;
  y: number;
};

type GlobeComponent = {
  coordinateSystem?: {
    dataToPoint: (data: number[]) => number[];
    viewGL?: {
      viewport: { x: number; y: number; width: number; height: number };
      camera?: {
        update: (force?: boolean) => void;
        viewMatrix: { array: number[] };
        projectionMatrix: { array: number[] };
        worldTransform: { array: number[] };
      };
    };
  };
};

function transformPoint(matrix: number[], x: number, y: number, z: number, w = 1) {
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w,
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w,
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w,
    matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w,
  ];
}

function labelInk(color: string) {
  const value = Number.parseInt(color.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.58 ? "#1a1a1a" : "#ffffff";
}

export function GlobeChart({
  countries,
  label,
  expanded = false,
}: GlobeChartProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState | null>(null);

  const option = useMemo(
    () =>
      ({
        backgroundColor: "transparent",
        animation: true,
        animationDuration: 600,
        tooltip: { show: false },
        globe: {
          baseTexture: "/brand/globe-texture.png",
          shading: "color",
          environment: "none",
          baseColor: "#ffffff",
          globeRadius: 100,
          globeOuterRadius: 101,
          light: {
            main: { intensity: 1.2, shadow: false },
            ambient: { intensity: 0.85 },
          },
          viewControl: {
            autoRotate: false,
            distance: expanded ? 155 : 125,
            alpha: 20,
            beta: 20,
            panSensitivity: 0,
            rotateSensitivity: 1,
            zoomSensitivity: 1,
            minDistance: 60,
            maxDistance: 300,
          },
        },
        series: [
          {
            type: "scatter3D",
            coordinateSystem: "globe",
            globeIndex: 0,
            symbol: "circle",
            symbolSize: expanded ? 48 : 28,
            itemStyle: { color: "#ffffff", opacity: 0 },
            label: { show: false },
            emphasis: { itemStyle: { opacity: 0 }, label: { show: false } },
            data: countries.map((country) => ({
              ...country,
              value: [country.longitude, country.latitude, 2],
            })),
          },
        ],
      }) as unknown as echarts.EChartsOption,
    [countries, expanded],
  );

  useEffect(() => {
    const node = chartRef.current;
    const layer = labelsRef.current;
    if (!node || !layer) return;

    const chart = echarts.init(node);
    chart.setOption(option);

    const place = () => {
      const width = node.clientWidth;
      const height = node.clientHeight;
      if (width === 0 || height === 0) return;

      const globe = (
        chart as unknown as {
          getModel: () => { getComponent: (name: string, index: number) => GlobeComponent | null };
        }
      )
        .getModel()
        .getComponent("globe", 0);
      const coordSys = globe?.coordinateSystem;
      const camera = coordSys?.viewGL?.camera;
      const viewport = coordSys?.viewGL?.viewport;
      if (camera) camera.update();
      const cameraWorld = camera?.worldTransform.array;
      const placed: { x: number; y: number; w: number; h: number }[] = [];

      countries.forEach((country, index) => {
        const pill = layer.children[index] as HTMLElement | undefined;
        if (!pill || !coordSys || !camera || !viewport || !cameraWorld) return;

        const point = coordSys.dataToPoint([country.longitude, country.latitude, 2]);
        const facing =
          point[0] * cameraWorld[12] + point[1] * cameraWorld[13] + point[2] * cameraWorld[14] > 0;
        const eye = transformPoint(camera.viewMatrix.array, point[0], point[1], point[2]);
        const clip = transformPoint(camera.projectionMatrix.array, eye[0], eye[1], eye[2], eye[3]);
        const pixel =
          facing && clip[3] > 0
            ? [
                viewport.x + (clip[0] / clip[3] * 0.5 + 0.5) * viewport.width,
                height - (viewport.y + (clip[1] / clip[3] * 0.5 + 0.5) * viewport.height),
              ]
            : null;

        if (!pixel || !Number.isFinite(pixel[0]) || !Number.isFinite(pixel[1])) {
          pill.style.visibility = "hidden";
          pill.style.pointerEvents = "none";
          return;
        }

        const labelWidth = Math.max(pill.offsetWidth, pill.scrollWidth);
        const labelHeight = Math.max(pill.offsetHeight, 16);
        const margin = 4;
        let x = pixel[0] - labelWidth / 2;
        let y = pixel[1] - labelHeight / 2;
        const clampLabel = () => {
          x = Math.min(Math.max(margin, x), Math.max(margin, width - labelWidth - margin));
          y = Math.min(Math.max(margin, y), Math.max(margin, height - labelHeight - margin));
        };
        const overlaps = (box: { x: number; y: number; w: number; h: number }) =>
          x < box.x + box.w + 2 &&
          x + labelWidth + 2 > box.x &&
          y < box.y + box.h + 2 &&
          y + labelHeight + 2 > box.y;
        clampLabel();
        let clear = !placed.some(overlaps);
        for (let attempt = 0; attempt < 10 && !clear; attempt += 1) {
          const hit = placed.find(overlaps);
          if (!hit) {
            clear = true;
            break;
          }
          const below = hit.y + hit.h + 4;
          const above = hit.y - labelHeight - 4;
          if (below + labelHeight <= height - margin) y = below;
          else if (above >= margin) y = above;
          else x = hit.x + hit.w + 4;
          clampLabel();
          clear = !placed.some(overlaps);
        }
        if (!clear) {
          pill.style.visibility = "hidden";
          pill.style.pointerEvents = "none";
          return;
        }
        placed.push({ x, y, w: labelWidth, h: labelHeight });
        pill.style.visibility = "visible";
        pill.style.pointerEvents = "auto";
        pill.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      });
    };

    const showTip = (country: CountryRegistration, clientX: number, clientY: number) => {
      setTip({
        text: `${country.name}: ${country.registrations.toLocaleString()} registrations`,
        x: clientX,
        y: clientY,
      });
    };

    const onOver = (params: { data?: CountryRegistration; event?: { event?: MouseEvent } }) => {
      const country = params.data;
      const event = params.event?.event;
      if (!country?.name || !event) return;
      showTip(country, event.clientX, event.clientY);
    };

    chart.on("mouseover", onOver as never);
    chart.getZr().on("rendered", place);
    const observer = new ResizeObserver(() => {
      chart.resize();
      place();
    });
    observer.observe(node);
    place();

    return () => {
      observer.disconnect();
      chart.off("mouseover", onOver as never);
      chart.dispose();
    };
  }, [option, countries]);

  return (
    <Frame
      ref={frameRef}
      onMouseLeave={() => setTip(null)}
    >
      <ChartSurface ref={chartRef} role="img" aria-label={label} />
      <LabelLayer ref={labelsRef}>
        {countries.map((country) => (
          <Pill
            key={country.name}
            $bg={country.color}
            $ink={labelInk(country.color)}
            $expanded={expanded}
            onMouseEnter={(event) =>
              setTip({
                text: `${country.name}: ${country.registrations.toLocaleString()} registrations`,
                x: event.clientX,
                y: event.clientY,
              })
            }
          >
            {country.name}: {country.registrations}
          </Pill>
        ))}
      </LabelLayer>
      {tip ? <HoverTip tip={tip} /> : null}
    </Frame>
  );
}

function HoverTip({ tip }: { tip: TipState }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: tip.x, top: tip.y });

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const gap = 12;
    const { width, height } = node.getBoundingClientRect();
    let left = tip.x + gap;
    let top = tip.y - height - gap;
    if (left + width > window.innerWidth - gap) left = tip.x - width - gap;
    if (left < gap) left = gap;
    if (top < gap) top = tip.y + gap;
    if (top + height > window.innerHeight - gap) top = Math.max(gap, window.innerHeight - height - gap);
    setPos({ left, top });
  }, [tip]);

  return createPortal(
    <Tip ref={ref} style={{ left: pos.left, top: pos.top }} role="tooltip">
      {tip.text}
    </Tip>,
    document.body,
  );
}

const Frame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const ChartSurface = styled.div`
  width: 100%;
  height: 100%;
`;

const LabelLayer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
`;

const Pill = styled.span<{ $bg: string; $ink: string; $expanded: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  visibility: hidden;
  pointer-events: auto;
  white-space: nowrap;
  font-family: ${CHART_FONT};
  font-size: ${(props) =>
    props.$expanded ? "var(--type-size-helper)" : "calc(var(--type-size-caption) * 0.85)"};
  font-weight: 600;
  line-height: 1.2;
  color: ${(props) => props.$ink};
  background: ${(props) => props.$bg};
  border-radius: var(--radius-100);
  padding: ${(props) =>
    props.$expanded ? "var(--space-050) var(--space-100)" : "var(--space-025) var(--space-050)"};
`;

const Tip = styled.div`
  position: fixed;
  z-index: 40;
  max-width: min(280px, calc(100vw - var(--space-400)));
  padding: var(--space-100) var(--space-200);
  border-radius: var(--radius-200);
  background: var(--color-surfaces-container);
  color: var(--color-text-icon-primary);
  border: 1px solid var(--color-surfaces-canvas);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25);
  font-family: ${CHART_FONT};
  font-size: var(--type-size-caption);
  pointer-events: none;
`;
