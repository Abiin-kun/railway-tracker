import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || "8080", 10);

const STATIONS = {
  NDLS: { code: "NDLS", name: "New Delhi", lat: 28.6419, lng: 77.2208, city: "New Delhi", state: "Delhi", zone: "Northern Railway" },
  HWH: { code: "HWH", name: "Howrah Junction", lat: 22.5822, lng: 88.342, city: "Kolkata", state: "West Bengal", zone: "Eastern Railway" },
  MMCT: { code: "MMCT", name: "Mumbai Central", lat: 18.9698, lng: 72.8192, city: "Mumbai", state: "Maharashtra", zone: "Western Railway" },
  CNB: { code: "CNB", name: "Kanpur Central", lat: 26.4499, lng: 80.3319, city: "Kanpur", state: "Uttar Pradesh", zone: "Northern Railway" },
  BPL: { code: "BPL", name: "Bhopal Junction", lat: 23.2752, lng: 77.4214, city: "Bhopal", state: "Madhya Pradesh", zone: "West Central Railway" },
  BWN: { code: "BWN", name: "Barddhaman Junction", lat: 23.24, lng: 87.86, city: "Bardhaman", state: "West Bengal" },
  DHN: { code: "DHN", name: "Dhanbad Junction", lat: 23.7956, lng: 86.4356, city: "Dhanbad", state: "Jharkhand" },
  GAYA: { code: "GAYA", name: "Gaya Junction", lat: 24.7956, lng: 84.9994, city: "Gaya", state: "Bihar" },
  MGS: { code: "MGS", name: "Mughalsarai Junction", lat: 25.2989, lng: 83.1194, city: "Mughalsarai", state: "Uttar Pradesh" },
  ALD: { code: "ALD", name: "Prayagraj Junction", lat: 25.4406, lng: 81.8464, city: "Prayagraj", state: "Uttar Pradesh" },
  BRC: { code: "BRC", name: "Vadodara Junction", lat: 22.31, lng: 73.18, city: "Vadodara", state: "Gujarat" },
  RTM: { code: "RTM", name: "Ratlam Junction", lat: 23.33, lng: 75.07, city: "Ratlam", state: "Madhya Pradesh" },
  KOTA: { code: "KOTA", name: "Kota Junction", lat: 25.19, lng: 75.86, city: "Kota", state: "Rajasthan" },
  MTJ: { code: "MTJ", name: "Mathura Junction", lat: 27.4924, lng: 77.6738, city: "Mathura", state: "Uttar Pradesh" },
  AGC: { code: "AGC", name: "Agra Cantt", lat: 27.1589, lng: 77.9906, city: "Agra", state: "Uttar Pradesh" },
  GWL: { code: "GWL", name: "Gwalior", lat: 26.2153, lng: 78.1927, city: "Gwalior", state: "Madhya Pradesh" },
};

const ROUTES = {
  "12301": [
    { code: "HWH", arr: null, dep: "13:05", dist: 0 },
    { code: "BWN", arr: "14:20", dep: "14:22", dist: 95 },
    { code: "DHN", arr: "16:35", dep: "16:40", dist: 260 },
    { code: "GAYA", arr: "18:48", dep: "18:53", dist: 463 },
    { code: "MGS", arr: "20:28", dep: "20:38", dist: 624 },
    { code: "ALD", arr: "22:13", dep: "22:18", dist: 822 },
    { code: "CNB", arr: "23:50", dep: "23:55", dist: 997 },
    { code: "NDLS", arr: "05:55", dep: null, dist: 1446 },
  ],
  "12002": [
    { code: "NDLS", arr: null, dep: "06:00", dist: 0 },
    { code: "MTJ", arr: "07:13", dep: "07:15", dist: 141 },
    { code: "AGC", arr: "07:48", dep: "07:50", dist: 199 },
    { code: "GWL", arr: "08:48", dep: "08:50", dist: 306 },
    { code: "BPL", arr: "11:30", dep: null, dist: 703 },
  ],
  "12951": [
    { code: "MMCT", arr: null, dep: "16:35", dist: 0 },
    { code: "BRC", arr: "19:50", dep: "19:55", dist: 381 },
    { code: "RTM", arr: "21:50", dep: "21:55", dist: 641 },
    { code: "KOTA", arr: "23:25", dep: "23:30", dist: 821 },
    { code: "NDLS", arr: "05:50", dep: null, dist: 1384 },
  ],
};

const TRAINS = {
  "12301": { number: "12301", name: "Howrah Rajdhani Express", src: "HWH", dst: "NDLS", class: "AC Express", days: "Daily", delay: 0 },
  "12002": { number: "12002", name: "New Delhi Bhopal Shatabdi", src: "NDLS", dst: "BPL", class: "Shatabdi Express", days: "Mon - Sat", delay: 5 },
  "12951": { number: "12951", name: "Mumbai Rajdhani Express", src: "MMCT", dst: "NDLS", class: "AC Express", days: "Daily", delay: 3 },
};

const ALL_TRAINS = Object.values(TRAINS);

function toMins(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function addMins(t, m) { const total = toMins(t) + m; return `${String(Math.floor((total % 1440) / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; }
function nowMins() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }

function computePosition(trainNum, demoTime) {
  const route = ROUTES[trainNum];
  if (!route) return {};
  const now = demoTime != null ? toMins(demoTime) : nowMins();
  const totalDuration = toMins(route.at(-1).arr || route.at(-1).dep) - toMins(route[0].dep || route[0].arr);
  const elapsed = now - toMins(route[0].dep || route[0].arr);
  const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

  let currentIdx = 0;
  for (let i = 0; i < route.length; i++) {
    if (now >= toMins(route[i].arr || route[i].dep)) currentIdx = i;
  }

  const current = route[currentIdx];
  const next = route[currentIdx + 1];
  const prev = route[currentIdx - 1];
  const station = STATIONS[current.code];

  const segmentProgress = next
    ? (now - toMins(current.dep || current.arr)) / (toMins(next.arr || next.dep) - toMins(current.dep || current.arr))
    : 1;

  const clamped = Math.min(1, Math.max(0, segmentProgress));
  const lat = station.lat + (next ? (STATIONS[next.code].lat - station.lat) * clamped : 0);
  const lng = station.lng + (next ? (STATIONS[next.code].lng - station.lng) * clamped : 0);

  return {
    currentStationName: station.name,
    currentStationCode: station.code,
    previousStationName: prev?.name ?? null,
    previousStationCode: prev?.code ?? null,
    nextStationName: next?.name ?? null,
    nextStationCode: next?.code ?? null,
    latitude: lat,
    longitude: lng,
    bearing: 180 + Math.random() * 90,
    routeProgress: progress,
    speedKmh: 110 + Math.random() * 30,
    statusText: progress < 5 ? "Departing" : progress > 95 ? "Arriving" : `Running ${Math.round(progress)}% of journey`,
    etaNextStation: next ? addMins(next.arr || next.dep, TRAINS[trainNum].delay) : null,
  };
}

function getRouteStops(trainNum, position) {
  const route = ROUTES[trainNum];
  if (!route) return [];
  const currentIdx = route.findIndex(r => r.code === position.currentStationCode);
  return route.map((s, i) => ({
    stationCode: s.code,
    stationName: STATIONS[s.code].name ?? s.code,
    latitude: STATIONS[s.code].lat,
    longitude: STATIONS[s.code].lng,
    scheduledArrival: s.arr,
    scheduledDeparture: s.dep,
    isPassed: i < currentIdx,
    isSource: i === 0,
    isDestination: i === route.length - 1,
    isCurrent: s.code === position.currentStationCode,
    distanceFromSource: s.dist,
    platform: `${Math.floor(Math.random() * 10) + 1}`,
  }));
}

function trainResponse(t) {
  const pos = computePosition(t.number);
  return {
    trainNumber: t.number, trainName: t.name,
    sourceStation: STATIONS[t.src].name, sourceStationCode: t.src,
    destinationStation: STATIONS[t.dst].name, destinationStationCode: t.dst,
    delayMinutes: t.delay, lastUpdated: new Date().toISOString(),
    statusText: pos.statusText, dataSource: "Simulated", confidence: 0.85,
    latitude: pos.latitude, longitude: pos.longitude, bearing: pos.bearing,
    routeProgress: pos.routeProgress, speedKmh: pos.speedKmh, classType: t.class,
    ...pos,
  };
}

app.get("/api/healthz", (_, res) => res.json({ status: "ok" }));

app.get("/api/train/:trainNumber", (req, res) => {
  const train = TRAINS[req.params.trainNumber];
  if (!train) return res.status(404).json({ error: "NOT_FOUND", message: `Train ${req.params.trainNumber} not found` });
  res.json(trainResponse(train));
});

app.get("/api/train/:trainNumber/route", (req, res) => {
  if (!TRAINS[req.params.trainNumber]) return res.status(404).json({ error: "NOT_FOUND", message: `Train ${req.params.trainNumber} not found` });
  const pos = computePosition(req.params.trainNumber, req.query.demoTime);
  res.json(getRouteStops(req.params.trainNumber, pos));
});

app.get("/api/station/:stationCode", (req, res) => {
  const station = STATIONS[req.params.stationCode.toUpperCase()];
  if (!station) return res.status(404).json({ error: "NOT_FOUND", message: `Station ${req.params.stationCode} not found` });
  res.json({
    station: { stationCode: station.code, stationName: station.name, latitude: station.lat, longitude: station.lng, city: station.city, state: station.state, zone: station.zone },
    arrivals: [], departures: [], dataSource: "Simulated", asOf: new Date().toISOString(), isDemoTime: !!req.query.demoTime,
  });
});

app.get("/api/search", (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase().trim();
  if (!q) return res.json({ query: q, trains: [], stations: [], total: 0 });
  const trains = ALL_TRAINS.filter(t => t.number.includes(q) || t.name.toLowerCase().includes(q)).map(t => ({
    type: "train", id: t.number, name: `${t.number} - ${t.name}`, subtitle: `${t.src} → ${t.dst}`, metadata: t.class,
  }));
  const stations = Object.values(STATIONS).filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || (s.city && s.city.toLowerCase().includes(q))).map(s => ({
    type: "station", id: s.code, name: s.name, subtitle: `${s.code} · ${s.city ?? ""}, ${s.state ?? ""}`, metadata: s.zone,
  }));
  res.json({ query: q, trains, stations, total: trains.length + stations.length });
});

app.get("/api/network/trains", (req, res) => {
  res.json(ALL_TRAINS.map(t => trainResponse(t)));
});

app.get("/api/system/health", (req, res) => {
  res.json({
    activeDataMode: "Simulated", activeProvider: "Local Engine", fallbackActive: false, mapTokenAvailable: false,
    providers: [{ name: "Position Engine", status: "working", lastChecked: new Date().toISOString(), lastError: null, capabilities: ["train_status", "route_data", "position_estimation", "search", "network"] }],
    missingEnvVars: [], sampleTrains: ["12301", "12002", "12951"], sampleStations: ["NDLS", "HWH", "CNB", "MMCT"], lastProviderError: null,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
