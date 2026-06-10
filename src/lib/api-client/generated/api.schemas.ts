export interface HealthStatus {
  status: string;
}

export interface TrainStatus {
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  sourceStationCode: string;
  destinationStation: string;
  destinationStationCode: string;
  previousStation?: string;
  previousStationCode?: string;
  currentStation?: string;
  currentStationCode?: string;
  nextStation?: string;
  nextStationCode?: string;
  delayMinutes: number;
  etaNextStation?: string;
  lastUpdated: string;
  statusText: string;
  dataSource?: string;
  confidence?: number;
  latitude?: number;
  longitude?: number;
  bearing?: number;
  routeProgress?: number;
  speedKmh?: number;
  classType?: string;
}

export interface RouteStop {
  stationCode: string;
  stationName: string;
  latitude?: number;
  longitude?: number;
  scheduledArrival?: string;
  scheduledDeparture?: string;
  isPassed: boolean;
  isSource: boolean;
  isDestination: boolean;
  isCurrent: boolean;
  distanceFromSource?: number;
  platform?: string;
}

export interface StationInfo {
  stationCode: string;
  stationName: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  zone?: string;
  stationType?: string;
}

export interface ArrivalEntry {
  stationCode: string;
  trainNumber: string;
  trainName: string;
  scheduledArrival?: string;
  scheduledDeparture?: string;
  eta?: string;
  etaMinutes?: number;
  delayMinutes: number;
  platform?: string;
  origin?: string;
  originCode?: string;
  destination?: string;
  destinationCode?: string;
  dataSource?: string;
  status: string;
}

export interface StationBoard {
  station: StationInfo;
  arrivals: ArrivalEntry[];
  departures: ArrivalEntry[];
  dataSource: string;
  asOf: string;
  isDemoTime: boolean;
}

export interface SearchParams {
  q: string;
}

export interface SearchResult {
  type: string;
  id: string;
  name: string;
  subtitle?: string;
  metadata?: string;
}

export interface SearchResults {
  query: string;
  trains: SearchResult[];
  stations: SearchResult[];
  total: number;
}

export interface ProviderStatus {
  name: string;
  status: string;
  lastChecked?: string;
  lastError?: string;
  capabilities: string[];
}

export interface SystemHealth {
  activeDataMode: string;
  activeProvider: string;
  fallbackActive: boolean;
  mapTokenAvailable: boolean;
  providers: ProviderStatus[];
  missingEnvVars: string[];
  sampleTrains: string[];
  sampleStations: string[];
  lastProviderError?: string;
}

export type TrainStatusDataSource = "live" | "estimated" | "scheduled" | "demo";

export interface ErrorResponse {
  error: string;
  message: string;
  suggestions?: string[];
}
