import { type ComponentType } from "react";
import { useLocation } from "wouter";
import {
  useGetSystemHealth,
  getGetSystemHealthQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Server,
  Map as MapIcon,
  Database,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

const Icon = ({ component: IconComp }: { component: ComponentType<{ className?: string }> }) => (
  <IconComp className="w-4 h-4 text-muted-foreground/50" />
);

function Section({
  title,
  description,
  icon,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-border/40 rounded-xl bg-card overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-border/30">
        <div className="flex items-center gap-2.5 mb-0.5">
          {icon && <Icon component={icon} />}
          <h2 className="text-[14px] font-semibold text-foreground/80">{title}</h2>
        </div>
        {description && (
          <p className="text-[12px] text-muted-foreground/45 mt-0.5">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function System() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: health, isLoading, error } = useGetSystemHealth({
    query: {
      queryKey: getGetSystemHealthQueryKey(),
      refetchInterval: 30_000,
    },
  });

  const handleRefresh = () =>
    queryClient.invalidateQueries({ queryKey: getGetSystemHealthQueryKey() });

  if (isLoading) return <LoadingState message="Checking system diagnostics…" />;
  if (error || !health)
    return (
      <ErrorState
        message="Failed to load system health."
        onRetry={handleRefresh}
      />
    );

  const isDegraded =
    health.fallbackActive ||
    health.providers.some((p) => p.status === "failing") ||
    health.missingEnvVars.length > 0;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 pb-20">
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border/30">
        <div>
          <h1 className="text-[22px] font-bold text-foreground mb-1">
            System Health
          </h1>
          <p className="text-[13px] text-muted-foreground/50">
            API integration status and telemetry diagnostics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDegraded ? (
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-400 border border-amber-500/20 bg-amber-500/8 px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" /> Degraded
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-400 border border-green-500/20 bg-green-500/8 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" /> Nominal
            </span>
          )}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Section
          title="Active Data Mode"
          description="Current source for railway telemetry"
          icon={Database}
        >
          <div className="px-5 py-4">
            <div className="flex items-center justify-between p-4 bg-muted/15 rounded-lg border border-border/30">
              <span className="font-mono text-[15px] font-bold text-foreground/80">
                {health.activeDataMode}
              </span>
              <Badge
                variant="outline"
                className="border-amber-500/30 text-amber-500/70 bg-amber-500/8 font-mono text-[10px]"
              >
                {health.activeDataMode}
              </Badge>
            </div>
            {health.fallbackActive && (
              <div className="mt-3 p-3 bg-amber-500/8 border border-amber-500/15 rounded-lg text-[12px] text-amber-400/80 flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <p>Fallback mode active. Serving estimated data.</p>
              </div>
            )}
            {health.lastProviderError && (
              <div className="mt-3 text-[11px] font-mono text-red-400/70 bg-red-500/8 border border-red-500/15 p-2.5 rounded-lg overflow-hidden text-ellipsis">
                {health.lastProviderError}
              </div>
            )}
          </div>
        </Section>

        <Section
          title="Map Configuration"
          description="Vector tile provider status"
          icon={MapIcon}
        >
          <div className="px-5 py-4">
            <div className="flex items-center justify-between p-4 bg-muted/15 rounded-lg border border-border/30">
              <span className="text-[13px] font-medium text-muted-foreground/70">
                MapLibre / CartoDB
              </span>
              {health.mapTokenAvailable ? (
                <span className="text-[11px] font-semibold text-green-400/70 border border-green-500/20 bg-green-500/8 px-2.5 py-1 rounded-full">
                  Available
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-muted-foreground/40 border border-border/30 bg-muted/20 px-2.5 py-1 rounded-full">
                  Public Tiles
                </span>
              )}
            </div>
            <p className="text-[12px] text-muted-foreground/40 mt-3 leading-relaxed">
              Using public basemaps. For high-volume use, configure a MapTiler
              or Mapbox token.
            </p>
          </div>
        </Section>

        <Section
          title="Integration Providers"
          description="Status of upstream API connections"
          icon={Server}
          className="md:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  {["Provider", "Status", "Capabilities", "Last Checked"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {health.providers.map((provider, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/15 hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[13px] font-medium text-foreground/75">
                      {provider.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-[6px] h-[6px] rounded-full ${
                            provider.status === "working"
                              ? "bg-green-500"
                              : provider.status === "failing"
                                ? "bg-red-500"
                                : "bg-muted-foreground/30"
                          }`}
                        />
                        <span className="text-[12px] capitalize text-muted-foreground/55">
                          {provider.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {provider.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="text-[10px] font-mono bg-muted/30 border border-border/30 px-1.5 py-0.5 rounded text-muted-foreground/60"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground/40 tabular-nums">
                      {provider.lastChecked
                        ? new Date(provider.lastChecked).toLocaleTimeString()
                        : "Never"}
                    </td>
                  </tr>
                ))}
                {health.providers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-[13px] text-muted-foreground/40"
                    >
                      No providers configured
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        {health.missingEnvVars.length > 0 && (
          <Section
            title="Configuration Warnings"
            icon={AlertTriangle}
            className="md:col-span-2 border-red-500/15"
          >
            <div className="px-5 py-4">
              <p className="text-[12px] text-muted-foreground/55 mb-3">
                Missing environment variables may degrade functionality:
              </p>
              <div className="flex flex-wrap gap-2">
                {health.missingEnvVars.map((env) => (
                  <span
                    key={env}
                    className="font-mono text-[11px] text-red-400/70 border border-red-500/20 bg-red-500/8 px-2.5 py-1 rounded-lg"
                  >
                    {env}
                  </span>
                ))}
              </div>
            </div>
          </Section>
        )}

        <Section
          title="Sample Data Entities"
          description="Jump to detailed views"
          className="md:col-span-2"
        >
          <div className="px-5 py-4 space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/35 mb-2.5">
                Trains
              </p>
              <div className="flex flex-wrap gap-2">
                {health.sampleTrains.map((train) => (
                  <button
                    key={train}
                    onClick={() => setLocation(`/train/${train}`)}
                    className="font-mono text-[12px] font-bold text-primary/70 border border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    {train}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/35 mb-2.5">
                Stations
              </p>
              <div className="flex flex-wrap gap-2">
                {health.sampleStations.map((station) => (
                  <button
                    key={station}
                    onClick={() => setLocation(`/station/${station}`)}
                    className="font-mono text-[12px] font-bold text-foreground/45 border border-border/40 hover:border-border/70 bg-muted/20 hover:bg-muted/35 px-3 py-1.5 rounded-lg transition-all"
                  >
                    {station}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
