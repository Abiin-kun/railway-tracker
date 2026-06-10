import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetStationArrivals, getGetStationArrivalsQueryKey } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

function useCountdown(secs: number) {
  const [s, setS] = useState(secs);
  useEffect(() => {
    const t = setInterval(() => setS(v => (v <= 1 ? secs : v - 1)), 1000);
    return () => clearInterval(t);
  }, [secs]);
  return s;
}

export default function Station() {
  const { stationCode } = useParams<{ stationCode: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [time, setTime] = useState(new Date());
  const [tab, setTab] = useState<"arrivals" | "departures">("arrivals");
  const [showMap, setShowMap] = useState(false);
  const countdown = useCountdown(60);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const { data, isLoading, error } = useGetStationArrivals(stationCode, {
    query: { queryKey: getGetStationArrivalsQueryKey(stationCode), refetchInterval: 60_000 },
  });

  useEffect(() => {
    if (data) document.title = `${data.station.stationCode} ${data.station.stationName} | RailRoute`;
    return () => { document.title = "RailRoute"; };
  }, [data?.station?.stationName]);

  const refresh = () => qc.invalidateQueries({ queryKey: getGetStationArrivalsQueryKey(stationCode) });

  if (isLoading) return <LoadingState message="Loading board…" />;
  if (error || !data) return <ErrorState message="Station not found." onRetry={refresh} />;

  const { station, arrivals, departures } = data;
  const rows = tab === "arrivals" ? arrivals : departures;
  const hasCoords = station.latitude != null && station.longitude != null;

  const statusOf = (e: typeof arrivals[0]) => {
    if (e.status === "arriving" || (e.etaMinutes != null && e.etaMinutes <= 10))
      return { label: "Arriving", cls: "text-primary font-semibold" };
    if (e.status === "departed")
      return { label: "Departed", cls: "text-slate-400" };
    if (e.delayMinutes > 0)
      return { label: `+${e.delayMinutes}m late`, cls: "text-orange-600 font-semibold" };
    return { label: "On Time", cls: "text-green-600 font-semibold" };
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white">

      <div className="px-5 pt-4 pb-0 border-b border-border shrink-0">
        <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-foreground">{station.stationName}</h1>
              <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{station.stationCode}</span>
              {station.zone && <span className="text-[11px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">{station.zone}</span>}
              {hasCoords && (
                <button
                  onClick={() => setShowMap(m => !m)}
                  className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${showMap ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                >
                  {showMap ? "Hide map" : "Show map"}
                </button>
              )}
            </div>
            {station.city && station.state && (
              <p className="text-[12px] text-muted-foreground mt-0.5">{station.city}, {station.state}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Local Time</p>
              <p className="font-mono text-base font-semibold text-foreground tabular-nums">
                {time.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </div>
            <button onClick={refresh} className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
              <span className="tabular-nums">{countdown}s</span>
            </button>
          </div>
        </div>

        {showMap && hasCoords && (
          <div className="h-40 rounded-lg overflow-hidden border border-border mb-3">
            <MapContainer
              center={[station.latitude, station.longitude]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' maxZoom={18} />
              <CircleMarker center={[station.latitude, station.longitude]} radius={10} fillColor="#2563eb" fillOpacity={1} color="#fff" weight={3}>
                <Tooltip permanent direction="top" offset={[0, -13]}>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{station.stationCode} · {station.stationName}</span>
                </Tooltip>
              </CircleMarker>
            </MapContainer>
          </div>
        )}

        <div className="flex gap-0">
          {(["arrivals", "departures"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">
                {t === "arrivals" ? arrivals.length : departures.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid px-5 py-2 border-b border-border bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0 min-w-0"
        style={{ gridTemplateColumns: "80px 1fr 110px 60px 60px 46px 90px" }}>
        <span>Train</span><span>Name</span><span>Route</span><span>Sched</span><span>ETA</span><span>PF</span><span className="text-right">Status</span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {rows.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-[13px] text-muted-foreground">
            No {tab} in the next 24 hours
          </div>
        ) : rows.map((e, i) => {
          const { label, cls } = statusOf(e);
          const arriving = e.status === "arriving" || (e.etaMinutes != null && e.etaMinutes <= 10);
          return (
            <div key={`${e.trainNumber}-${i}`}
              onClick={() => nav(`/train/${e.trainNumber}`)}
              className={`grid px-5 py-3 items-center cursor-pointer hover:bg-accent transition-colors border-b border-border/60 min-w-0 ${arriving ? "bg-blue-50/60" : i % 2 === 1 ? "bg-muted/15" : "bg-white"}`}
              style={{ gridTemplateColumns: "80px 1fr 110px 60px 60px 46px 90px" }}>
              <span className="font-mono text-[12px] font-semibold text-primary">{e.trainNumber}</span>
              <span className="text-[13px] text-foreground truncate pr-2">{e.trainName}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{e.originCode} → {e.destinationCode}</span>
              <span className="font-mono text-[12px] text-muted-foreground tabular-nums">{e.scheduledArrival?.slice(0, 5) ?? "—"}</span>
              <span className={`font-mono text-[12px] tabular-nums font-semibold ${e.delayMinutes > 0 ? "text-orange-600" : "text-foreground"}`}>{e.eta?.slice(0, 5) ?? "—"}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{e.platform ?? "—"}</span>
              <span className={`text-[12px] text-right ${cls}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
