import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetTrainStatus, useGetTrainRoute, getGetTrainStatusQueryKey } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import TrainMap from "@/components/TrainMap";

const TRAIN_META: Record<string, { daysOfRun: string; classType: string; totalKm: number }> = {
  "12301": { daysOfRun: "Daily", classType: "AC Express", totalKm: 1446 },
  "12002": { daysOfRun: "Mon – Sat", classType: "Shatabdi Express", totalKm: 703 },
  "12951": { daysOfRun: "Daily", classType: "AC Express", totalKm: 1384 },
};

function useCountdown(intervalSeconds: number) {
  const [secs, setSecs] = useState(intervalSeconds);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => (s <= 1 ? intervalSeconds : s - 1)), 1000);
    return () => clearInterval(t);
  }, [intervalSeconds]);
  return secs;
}

export default function Train() {
  const { trainNumber } = useParams<{ trainNumber: string }>();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const countdown = useCountdown(30);

  const { data: status, isLoading: isStatusLoading, error: statusError } = useGetTrainStatus(trainNumber, {
    query: { refetchInterval: 30_000 },
  });
  const { data: stops, isLoading: isRouteLoading } = useGetTrainRoute(trainNumber);

  useEffect(() => {
    if (status) document.title = `${status.trainNumber} ${status.trainName} | RailRoute`;
    return () => { document.title = "RailRoute"; };
  }, [status?.trainName]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: getGetTrainStatusQueryKey(trainNumber) });
  };

  if (isStatusLoading || isRouteLoading) return <LoadingState message="Loading train…" />;
  if (statusError || !status) return <ErrorState message="Train not found." onRetry={refresh} />;

  const isDelayed = status.delayMinutes > 0;
  const progress = Math.max(0, Math.min(100, status.routeProgress));
  const meta = TRAIN_META[trainNumber] ?? { daysOfRun: "—", classType: "—", totalKm: 0 };
  const kmTraveled = Math.round((progress / 100) * meta.totalKm);
  const kmRemaining = meta.totalKm - kmTraveled;

  const passedCount = (stops ?? []).filter(s => s.isPassed).length;
  const totalStops = (stops ?? []).length;

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">

      <div className="w-full lg:w-[58%] h-56 sm:h-80 lg:h-full border-b lg:border-b-0 lg:border-r border-border flex-shrink-0">
        <TrainMap
          routeStops={stops}
          trainStatus={status}
          onStationClick={code => setLocation(`/station/${code}`)}
        />
      </div>

      <div className="flex-1 bg-white overflow-y-auto flex flex-col">

        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] text-muted-foreground mb-0.5">{status.trainNumber}</p>
              <h1 className="text-lg font-semibold text-foreground leading-tight">{status.trainName}</h1>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isDelayed ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                {isDelayed ? `+${status.delayMinutes} min late` : "On Time"}
              </span>
              {status.speedKmh != null && status.speedKmh > 0 && (
                <span className="text-[11px] font-mono text-muted-foreground">{status.speedKmh} km/h</span>
              )}
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1.5">{status.statusText}</p>

          <div className="flex flex-wrap gap-3 mt-2.5">
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{meta.classType}</span>
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{meta.daysOfRun}</span>
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{meta.totalKm} km total</span>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-border">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] font-mono text-muted-foreground">{status.sourceStation}</span>
            <span className="font-mono text-[11px] font-semibold text-primary">{Math.round(progress)}%</span>
            <span className="text-[11px] font-mono text-muted-foreground">{status.destinationStation}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.max(2, progress)}%` }} />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[11px] text-muted-foreground">{kmTraveled} km traveled</span>
            <span className="text-[11px] text-muted-foreground">{kmRemaining} km to go</span>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-border divide-x divide-border">
          <div className="px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Stations passed</p>
            <p className="font-mono text-sm font-semibold text-foreground">{passedCount} <span className="text-muted-foreground font-normal">/ {totalStops}</span></p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Delay</p>
            <p className={`font-mono text-sm font-semibold ${isDelayed ? "text-orange-600" : "text-muted-foreground"}`}>
              {isDelayed ? `+${status.delayMinutes} min` : "None"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-5 pt-3 pb-1.5">Route · {totalStops} stops</p>
          {(stops ?? []).map((stop, i) => (
            <div
              key={stop.stationCode}
              onClick={() => setLocation(`/station/${stop.stationCode}`)}
              className={`flex items-start gap-3 px-5 py-2.5 border-b border-border/50 cursor-pointer transition-colors group ${
                stop.isCurrent ? "bg-blue-50 hover:bg-blue-100" : stop.isPassed ? "opacity-40 hover:opacity-60 hover:bg-accent" : "hover:bg-accent"
              }`}
            >
              <div className="flex flex-col items-center pt-[5px] shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                  stop.isCurrent ? "bg-primary border-primary shadow-[0_0_0_3px_rgba(37,99,235,0.15)]" :
                  stop.isSource || stop.isDestination ? "bg-slate-800 border-slate-800" :
                  stop.isPassed ? "bg-slate-400 border-slate-400" : "bg-white border-slate-400"
                }`} />
                {i < (stops?.length ?? 0) - 1 && <div className="w-px h-5 bg-border mt-0.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[13px] font-medium group-hover:text-primary transition-colors ${stop.isCurrent ? "text-primary" : "text-foreground"}`}>
                    {stop.stationName}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{stop.stationCode}</span>
                  {stop.isCurrent && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary text-white rounded">HERE</span>}
                  {!stop.isCurrent && !stop.isPassed && i > 0 && stops?.[i - 1]?.isCurrent && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">NEXT</span>
                  )}
                </div>
                <div className="flex gap-3 text-[11px] font-mono text-muted-foreground mt-0.5 flex-wrap">
                  {stop.scheduledArrival && <span>arr {stop.scheduledArrival.slice(0, 5)}</span>}
                  {stop.scheduledDeparture && <span>dep {stop.scheduledDeparture.slice(0, 5)}</span>}
                  {stop.distanceFromSource != null && <span>{stop.distanceFromSource} km</span>}
                  {stop.platform && <span className="text-slate-500 bg-slate-50 px-1 rounded border border-slate-200">pf {stop.platform}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-2.5 border-t border-border flex items-center justify-between shrink-0">
          <span className="font-mono text-[11px] text-muted-foreground">
            Updated {new Date(status.lastUpdated).toLocaleTimeString()} · refreshes in {countdown}s
          </span>
          <button onClick={refresh} className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
