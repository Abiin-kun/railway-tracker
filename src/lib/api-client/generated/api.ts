import { useQuery } from '@tanstack/react-query';
import type { QueryFunction, QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ErrorResponse, HealthStatus, RouteStop, SearchParams, SearchResults, StationBoard, SystemHealth, TrainStatus } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType } from '../custom-fetch';

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : O;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const getHealthCheckUrl = () => `/api/healthz`;

export const healthCheck = async (options?: RequestInit): Promise<HealthStatus> => {
  return customFetch<HealthStatus>(getHealthCheckUrl(), { ...options, method: 'GET' });
};

export const getHealthCheckQueryKey = () => [`/api/healthz`] as const;

export const getHealthCheckQueryOptions = <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();
  const queryFn: QueryFunction<Awaited<ReturnType<typeof healthCheck>>> = ({ signal }) => healthCheck({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & { queryKey: QueryKey };
};

export function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getHealthCheckQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getGetTrainStatusUrl = (trainNumber: string) => `/api/train/${trainNumber}`;

export const getTrainStatus = async (trainNumber: string, options?: RequestInit): Promise<TrainStatus> => {
  return customFetch<TrainStatus>(getGetTrainStatusUrl(trainNumber), { ...options, method: 'GET' });
};

export const getGetTrainStatusQueryKey = (trainNumber: string) => [`/api/train/${trainNumber}`] as const;

export const getGetTrainStatusQueryOptions = <TData = Awaited<ReturnType<typeof getTrainStatus>>, TError = ErrorType<ErrorResponse>>(
  trainNumber: string, options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getTrainStatus>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetTrainStatusQueryKey(trainNumber);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getTrainStatus>>> = ({ signal }) => getTrainStatus(trainNumber, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: !!(trainNumber), ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getTrainStatus>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetTrainStatus<TData = Awaited<ReturnType<typeof getTrainStatus>>, TError = ErrorType<ErrorResponse>>(
  trainNumber: string, options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getTrainStatus>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetTrainStatusQueryOptions(trainNumber, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getGetTrainRouteUrl = (trainNumber: string) => `/api/train/${trainNumber}/route`;

export const getTrainRoute = async (trainNumber: string, options?: RequestInit): Promise<RouteStop[]> => {
  return customFetch<RouteStop[]>(getGetTrainRouteUrl(trainNumber), { ...options, method: 'GET' });
};

export const getGetTrainRouteQueryKey = (trainNumber: string) => [`/api/train/${trainNumber}/route`] as const;

export const getGetTrainRouteQueryOptions = <TData = Awaited<ReturnType<typeof getTrainRoute>>, TError = ErrorType<ErrorResponse>>(
  trainNumber: string, options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getTrainRoute>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetTrainRouteQueryKey(trainNumber);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getTrainRoute>>> = ({ signal }) => getTrainRoute(trainNumber, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: !!(trainNumber), ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getTrainRoute>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetTrainRoute<TData = Awaited<ReturnType<typeof getTrainRoute>>, TError = ErrorType<ErrorResponse>>(
  trainNumber: string, options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getTrainRoute>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetTrainRouteQueryOptions(trainNumber, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getGetStationArrivalsUrl = (stationCode: string) => `/api/station/${stationCode}`;

export const getStationArrivals = async (stationCode: string, options?: RequestInit): Promise<StationBoard> => {
  return customFetch<StationBoard>(getGetStationArrivalsUrl(stationCode), { ...options, method: 'GET' });
};

export const getGetStationArrivalsQueryKey = (stationCode: string) => [`/api/station/${stationCode}`] as const;

export const getGetStationArrivalsQueryOptions = <TData = Awaited<ReturnType<typeof getStationArrivals>>, TError = ErrorType<ErrorResponse>>(
  stationCode: string, options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getStationArrivals>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetStationArrivalsQueryKey(stationCode);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getStationArrivals>>> = ({ signal }) => getStationArrivals(stationCode, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: !!(stationCode), ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getStationArrivals>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetStationArrivals<TData = Awaited<ReturnType<typeof getStationArrivals>>, TError = ErrorType<ErrorResponse>>(
  stationCode: string, options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getStationArrivals>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetStationArrivalsQueryOptions(stationCode, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getSearchUrl = (params: SearchParams) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) normalizedParams.append(key, value === null ? 'null' : value.toString());
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0 ? `/api/search?${stringifiedParams}` : `/api/search`;
};

export const search = async (params: SearchParams, options?: RequestInit): Promise<SearchResults> => {
  return customFetch<SearchResults>(getSearchUrl(params), { ...options, method: 'GET' });
};

export const getSearchQueryKey = (params?: SearchParams) => [`/api/search`, ...(params ? [params] : [])] as const;

export const getSearchQueryOptions = <TData = Awaited<ReturnType<typeof search>>, TError = ErrorType<unknown>>(
  params: SearchParams, options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getSearchQueryKey(params);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof search>>> = ({ signal }) => search(params, { signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData> & { queryKey: QueryKey };
};

export function useSearch<TData = Awaited<ReturnType<typeof search>>, TError = ErrorType<unknown>>(
  params: SearchParams, options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getSearchQueryOptions(params, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getGetNetworkTrainsUrl = () => `/api/network/trains`;

export const getNetworkTrains = async (options?: RequestInit): Promise<TrainStatus[]> => {
  return customFetch<TrainStatus[]>(getGetNetworkTrainsUrl(), { ...options, method: 'GET' });
};

export const getGetNetworkTrainsQueryKey = () => [`/api/network/trains`] as const;

export const getGetNetworkTrainsQueryOptions = <TData = Awaited<ReturnType<typeof getNetworkTrains>>, TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getNetworkTrains>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetNetworkTrainsQueryKey();
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getNetworkTrains>>> = ({ signal }) => getNetworkTrains({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getNetworkTrains>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetNetworkTrains<TData = Awaited<ReturnType<typeof getNetworkTrains>>, TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getNetworkTrains>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetNetworkTrainsQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getGetSystemHealthUrl = () => `/api/system/health`;

export const getSystemHealth = async (options?: RequestInit): Promise<SystemHealth> => {
  return customFetch<SystemHealth>(getGetSystemHealthUrl(), { ...options, method: 'GET' });
};

export const getGetSystemHealthQueryKey = () => [`/api/system/health`] as const;

export const getGetSystemHealthQueryOptions = <TData = Awaited<ReturnType<typeof getSystemHealth>>, TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getSystemHealth>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetSystemHealthQueryKey();
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getSystemHealth>>> = ({ signal }) => getSystemHealth({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getSystemHealth>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetSystemHealth<TData = Awaited<ReturnType<typeof getSystemHealth>>, TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getSystemHealth>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetSystemHealthQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}
