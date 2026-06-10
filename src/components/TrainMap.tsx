import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { RouteStop, TrainStatus } from "@/lib/api-client";

type LL = [number, number];

function FitBounds({ positions }: { positions: LL[] }) {
  const map = useMap();
  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    if (positions.length >= 2) {
      mapRef.current.fitBounds(L.latLngBounds(positions), { padding: [36, 36], maxZoom: 9 });
    }
  }, [positions]);
  return null;
}

interface Props {
  routeStops?: RouteStop[];
  trainStatus?: TrainStatus;
  onStationClick?: (code: string) => void;
}

export default function TrainMap({ routeStops, trainStatus, onStationClick }: Props) {
  const valid = (routeStops ?? []).filter(s => s.latitude != null && s.longitude != null);
  const all: LL[] = valid.map(s => [s.latitude!, s.longitude!]);
  const traveled: LL[] = valid.filter(s => s.isPassed || s.isCurrent).map(s => [s.latitude!, s.longitude!]);

  const trainPos: LL | null =
    trainStatus?.latitude != null && trainStatus?.longitude != null
      ? [trainStatus.latitude, trainStatus.longitude]
      : null;

  return (
    <MapContainer
      center={all[0] ?? [22.5937, 78.9629]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      zoomControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        maxZoom={18}
      />

      {all.length >= 2 && <Polyline positions={all} color="#94a3b8" weight={3} opacity={0.45} dashArray="6,4" />}
      {traveled.length >= 2 && <Polyline positions={traveled} color="#2563eb" weight={4} opacity={0.9} />}

      {valid.map(stop => (
        <CircleMarker
          key={stop.stationCode}
          center={[stop.latitude!, stop.longitude!]}
          radius={stop.isSource || stop.isDestination ? 7 : stop.isCurrent ? 7 : 4.5}
          fillColor={stop.isCurrent ? "#2563eb" : stop.isSource || stop.isDestination ? "#0f172a" : stop.isPassed ? "#94a3b8" : "#fff"}
          fillOpacity={1}
          color={stop.isCurrent ? "#1d4ed8" : stop.isPassed ? "#94a3b8" : "#475569"}
          weight={2}
          eventHandlers={{ click: () => onStationClick?.(stop.stationCode) }}
        >
          {(stop.isSource || stop.isDestination || stop.isCurrent) && (
            <Tooltip
              permanent
              direction={stop.isDestination ? "left" : "right"}
              offset={[8, 0]}
              opacity={1}
              className="!bg-white !text-[11px] !font-medium !text-slate-700 !border-slate-200 !shadow-sm !rounded !py-0.5 !px-2"
            >
              {stop.stationCode}
            </Tooltip>
          )}
          {!stop.isSource && !stop.isDestination && !stop.isCurrent && (
            <Tooltip direction="right" offset={[6, 0]} opacity={0.9}>
              <span className="text-[11px]">{stop.stationName} <span className="text-slate-400">({stop.stationCode})</span></span>
            </Tooltip>
          )}
          <Popup>
            <div style={{ minWidth: 160 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 2 }}>{stop.stationName}</p>
              <p style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>{stop.stationCode}</p>
              {stop.scheduledArrival && <p style={{ fontSize: 12, color: "#334155" }}>Arr {stop.scheduledArrival.slice(0, 5)}</p>}
              {stop.scheduledDeparture && <p style={{ fontSize: 12, color: "#334155" }}>Dep {stop.scheduledDeparture.slice(0, 5)}</p>}
              {stop.platform && <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Platform {stop.platform}</p>}
              {onStationClick && (
                <button
                  onClick={() => onStationClick(stop.stationCode)}
                  style={{ marginTop: 8, fontSize: 12, color: "#2563eb", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0 }}
                >
                  View station board →
                </button>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {trainPos && (
        <CircleMarker center={trainPos} radius={9} fillColor="#2563eb" fillOpacity={1} color="#fff" weight={3}>
          <Tooltip permanent direction="top" offset={[0, -10]} opacity={0.95}>
            <span style={{ fontSize: 11, fontWeight: 600 }}>
              {trainStatus?.trainNumber} {trainStatus?.speedKmh ? `· ${trainStatus.speedKmh} km/h` : ""}
            </span>
          </Tooltip>
          <Popup>
            <p style={{ fontWeight: 600, fontSize: 13 }}>{trainStatus?.trainName}</p>
            <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{trainStatus?.statusText}</p>
            {trainStatus?.speedKmh ? <p style={{ fontSize: 11 }}>{trainStatus.speedKmh} km/h</p> : null}
          </Popup>
        </CircleMarker>
      )}

      {all.length >= 2 && <FitBounds positions={all} />}
    </MapContainer>
  );
}
