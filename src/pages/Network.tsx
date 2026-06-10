import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  useGetNetworkTrains, getGetNetworkTrainsQueryKey,
  useGetTrainRoute,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

// Fixed colors per train
const TRAIN_COLORS: Record<string, string> = {
  "12301": "#e11d48",   // rose — Howrah Rajdhani
  "12002": "#7c3aed",   // violet — Bhopal Shatabdi
  "12951": "#0891b2",   // cyan — Mumbai Rajdhani
};

type LL = [number, number];

function NetworkMap({ trains, routes, onTrain, onStation }: {
  trains: any[];
  routes: Record<string, LL[]>;
  onTrain: (id: string) => void;
  onStation: (code: string) => void;
}) {
  return (
    <MapContainer center={[22.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }} zoomControl>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        maxZoom={18}
      />

      {/* Route polylines */}
      {Object.entries(routes).map(([trainNum, positions]) => (
        positions.length >= 2 && (
          <Polyline
            key={trainNum}
            positions={positions}
            color={TRAIN_COLORS[trainNum] ?? "#64748b"}
            weight={3}
            opacity={0.7}
          />
        )
      ))}

      {/* Train position markers */}
      {trains.filter(t => t.latitude != null).map(train => {
        const color = TRAIN_COLORS[train.trainNumber] ?? "#2563eb";
        const late = train.delayMinutes > 0;
        return (
          <CircleMarker
            key={train.trainNumber}
            center={[train.latitude!, train.longitude!]}
            radius={11}
            fillColor={late ? "#ea580c" : color}
            fillOpacity={0.95}
            color="#fff"
            weight={2.5}
            eventHandlers={{ click: () => onTrain(train.trainNumber) }}
          >
            <Tooltip permanent direction="top" offset={[0, -13]} opacity={0.95}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{train.trainNumber}</span>
            </Tooltip>
            <Popup>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{train.trainName}</p>
              <p style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginTop: 2 }}>{train.trainNumber}</p>
              <p style={{ fontSize: 12, marginTop: 6 }}>{train.sourceStation} → {train.destinationStation}</p>
              <p style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: late ? "#ea580c" : "#16a34a" }}>
                {late ? `+${train.delayMinutes} min delay` : "On Time"}
              </p>
              {train.speedKmh ? <p style={{ fontSize: 11, color: "#64748b" }}>{train.speedKmh} km/h · {Math.round(train.routeProgress ?? 0)}% complete</p> : null}
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{train.statusText}</p>
              <button onClick={() => onTrain(train.trainNumber)}
                style={{ display: "block", marginTop: 10, fontSize: 12, color: color, fontWeight: 700, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
                Track this train →
              </button>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

export default function Network() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  useEffect(() => { document.title = "Network Map | RailRoute"; return () => { document.title = "RailRoute"; }; }, []);

  const { data: trains, isLoading, error } = useGetNetworkTrains({
    query: { refetchInterval: 30_000 },
  });

  const { data: stops12301 } = useGetTrainRoute("12301");
  const { data: stops12002 } = useGetTrainRoute("12002");
  const { data: stops12951 } = useGetTrainRoute("12951");

  const refresh = () => qc.invalidateQueries({ queryKey: getGetNetworkTrainsQueryKey() });

  if (isLoading) return <LoadingState message="Loading network…" />;
  if (error || !trains) return <ErrorState message="Could not load network data." onRetry={refresh} />;

  const toPositions = (stops?: typeof stops12301): LL[] =>
    (stops ?? []).filter(s => s.latitude != null && s.longitude != null)
      .map(s => [s.latitude!, s.longitude!]);

  const routes: Record<string, LL[]> = {
    "12301": toPositions(stops12301),
    "12002": toPositions(stops12002),
    "12951": toPositions(stops12951),
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">

      {/* Map */}
      <div className="flex-1 min-h-0">
        <NetworkMap
          trains={trains}
          routes={routes}
          onTrain={id => setLocation(`/train/${id}`)}
          onStation={code => setLocation(`/station/${code}`)}
        />
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-72 shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-border flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <p className="text-[13px] font-semibold text-foreground">Active Trains</p>
            <p className="text-[11px] text-muted-foreground">{trains.length} in network</p>
          </div>
          <button onClick={refresh} className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
            Refresh
          </button>
        </div>

        {/* Legend */}
        <div className="px-4 py-2 border-b border-border flex gap-3 flex-wrap shrink-0">
          {Object.entries(TRAIN_COLORS).map(([num, color]) => (
            <div key={num} className="flex items-center gap-1.5">
              <div className="w-4 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-mono text-[10px] text-muted-foreground">{num}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {trains.map(train => {
            const late = train.delayMinutes > 0;
            const progress = Math.max(0, Math.min(100, train.routeProgress ?? 0));
            const color = TRAIN_COLORS[train.trainNumber];
            return (
              <button
                key={train.trainNumber}
                onClick={() => setLocation(`/train/${train.trainNumber}`)}
                className="w-full text-left px-4 py-3 border-b border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-mono text-[11px] text-muted-foreground">{train.trainNumber}</span>
                    </div>
                    <span className="text-[13px] font-medium text-foreground leading-tight">{train.trainName}</span>
                  </div>
                  <span className={`text-[11px] font-semibold shrink-0 ${late ? "text-orange-600" : "text-green-600"}`}>
                    {late ? `+${train.delayMinutes}m` : "On Time"}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground mb-2">
                  {train.sourceStation} → {train.destinationStation}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(2, progress)}%`, backgroundColor: color }} />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">{Math.round(progress)}%</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {train.speedKmh ? `${train.speedKmh} km/h · ` : ""}{train.statusText}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
