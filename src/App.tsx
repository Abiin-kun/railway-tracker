import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TrainPage from "@/pages/Train";
import StationPage from "@/pages/Station";
import NetworkPage from "@/pages/Network";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Navbar() {
  const [location, setLocation] = useLocation();
  const isNetwork = location === "/network";
  const isHome = location === "/";
  const parts = location.split("/").filter(Boolean);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isHome) setLocation("/");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isHome]);

  return (
    <nav className="h-10 bg-white border-b border-border flex items-center px-4 shrink-0 gap-3 z-50">
      <Link href="/" className="font-mono text-[13px] font-semibold text-foreground tracking-tight shrink-0 hover:text-primary transition-colors">
        RailRoute
      </Link>
      {parts.length >= 2 && (
        <>
          <span className="text-border">/</span>
          <span className="font-mono text-[12px] text-muted-foreground truncate">
            {parts.join(" / ")}
          </span>
        </>
      )}
      <div className="ml-auto flex items-center gap-2">
        {!isHome && !isNetwork && (
          <button
            onClick={() => setLocation("/")}
            className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            title="Press Escape"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Home
          </button>
        )}
        <Link
          href="/network"
          className={`px-3 py-1 rounded text-[13px] transition-colors ${
            isNetwork ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          Network Map
        </Link>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/train/:trainNumber" component={TrainPage} />
      <Route path="/station/:stationCode" component={StationPage} />
      <Route path="/network" component={NetworkPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <div className="h-screen flex flex-col bg-background overflow-hidden">
          <Navbar />
          <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Router />
          </main>
        </div>
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
