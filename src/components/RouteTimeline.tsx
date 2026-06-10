import type { RouteStop, TrainStatus } from "@/lib/api-client";

interface Props {
  trainStatus?: TrainStatus;
  routeStops?: RouteStop[];
}

export default function RouteTimeline({ trainStatus, routeStops }: Props) {
  if (!routeStops || routeStops.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No route data</p>
      </div>
    );
  }

  const progress = trainStatus?.routeProgress ?? 0;
  const totalStops = routeStops.length;

  const padTop = 40;
  const padBottom = 40;
  const svgW = 320;
  const svgH = Math.max(totalStops * 80, 300);
  const trackX = 52;
  const contentX = trackX + 22;
  const usableH = svgH - padTop - padBottom;

  const stopY = (idx: number) => padTop + (idx / Math.max(totalStops - 1, 1)) * usableH;
  const trainY = padTop + (progress / 100) * usableH;

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="text-foreground font-medium">{trainStatus?.sourceStation ?? "—"}</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <span className="text-foreground font-medium">{trainStatus?.destinationStation ?? "—"}</span>
        </div>
        <span className="text-xs font-mono font-semibold text-primary">{Math.round(progress)}%</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          style={{ minHeight: svgH, display: "block" }}
          preserveAspectRatio="xMidYMin meet"
        >
          <line
            x1={trackX} y1={padTop}
            x2={trackX} y2={svgH - padBottom}
            stroke="hsl(228 10% 20%)"
            strokeWidth={2}
            strokeLinecap="round"
          />

          <line
            x1={trackX} y1={padTop}
            x2={trackX} y2={Math.min(trainY, svgH - padBottom)}
            stroke="hsl(217 91% 60%)"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {routeStops.map((stop, idx) => {
            const y = stopY(idx);
            const isCurrent = stop.isCurrent;
            const isPassed = stop.isPassed;
            const isNext = !isPassed && !isCurrent && idx > 0 && routeStops[idx - 1]?.isCurrent;
            const isLast = idx === totalStops - 1;

            const dotR = isCurrent ? 7 : isNext ? 5 : isLast ? 5 : 4;
            const dotFill = isCurrent
              ? "hsl(217 91% 60%)"
              : isPassed
              ? "hsl(228 10% 20%)"
              : "hsl(228 10% 8%)";
            const dotStroke = isCurrent
              ? "hsl(217 91% 60%)"
              : isPassed
              ? "hsl(228 10% 30%)"
              : isNext || isLast
              ? "hsl(228 8% 46%)"
              : "hsl(228 8% 30%)";
            const codeColor = isCurrent
              ? "hsl(217 91% 60%)"
              : isPassed
              ? "hsl(228 8% 36%)"
              : "hsl(228 8% 56%)";
            const nameColor = isCurrent
              ? "hsl(220 14% 92%)"
              : isPassed
              ? "hsl(228 8% 36%)"
              : "hsl(220 14% 75%)";
            const timeColor = isPassed
              ? "hsl(228 8% 30%)"
              : "hsl(228 8% 46%)";

            return (
              <g key={stop.stationCode}>
                {isCurrent && (
                  <circle cx={trackX} cy={y} r={11} fill="hsl(217 91% 60% / 0.12)" />
                )}
                <circle
                  cx={trackX} cy={y} r={dotR}
                  fill={dotFill}
                  stroke={dotStroke}
                  strokeWidth={isCurrent ? 0 : 1.5}
                />

                <text
                  x={contentX} y={y - 6}
                  fontSize={9}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight={600}
                  fill={codeColor}
                  letterSpacing={0.5}
                >
                  {stop.stationCode}
                </text>

                <text
                  x={contentX} y={y + 7}
                  fontSize={12}
                  fontFamily="Inter, sans-serif"
                  fontWeight={isCurrent ? 500 : 400}
                  fill={nameColor}
                >
                  {stop.stationName}
                </text>

                <text
                  x={contentX} y={y + 20}
                  fontSize={9.5}
                  fontFamily="'JetBrains Mono', monospace"
                  fill={timeColor}
                >
                  {[
                    stop.scheduledArrival ? `arr ${stop.scheduledArrival.slice(0, 5)}` : null,
                    stop.scheduledDeparture ? `dep ${stop.scheduledDeparture.slice(0, 5)}` : null,
                    stop.platform ? `pf ${stop.platform}` : null,
                  ]
                    .filter(Boolean)
                    .join("  ")}
                </text>

                {isCurrent && (
                  <g>
                    <rect x={svgW - 44} y={y - 9} width={36} height={14} rx={3} fill="hsl(217 91% 60%)" />
                    <text x={svgW - 26} y={y + 0} fontSize={8} fontFamily="'JetBrains Mono', monospace" fontWeight={600} fill="hsl(230 15% 5%)" textAnchor="middle" letterSpacing={0.5}>HERE</text>
                  </g>
                )}
                {isNext && (
                  <g>
                    <rect x={svgW - 44} y={y - 9} width={36} height={14} rx={3} fill="hsl(228 10% 16%)" stroke="hsl(228 10% 22%)" strokeWidth={1} />
                    <text x={svgW - 26} y={y + 0} fontSize={8} fontFamily="'JetBrains Mono', monospace" fontWeight={600} fill="hsl(228 8% 56%)" textAnchor="middle" letterSpacing={0.5}>NEXT</text>
                  </g>
                )}
              </g>
            );
          })}

          {progress > 2 && progress < 99 && (
            <g>
              <circle
                cx={trackX} cy={trainY} r={4}
                fill="hsl(217 91% 70%)"
                stroke="hsl(230 15% 5%)"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
      </div>

      {trainStatus?.latitude != null && (
        <div className="px-4 py-2 border-t border-border shrink-0">
          <span className="text-xs font-mono text-muted-foreground tabular-nums">
            {trainStatus.latitude?.toFixed(4)}°N {trainStatus.longitude?.toFixed(4)}°E
            {trainStatus.bearing != null && ` · ${Math.round(trainStatus.bearing)}°`}
          </span>
        </div>
      )}
    </div>
  );
}
