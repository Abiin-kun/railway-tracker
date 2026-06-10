import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useSearch, getSearchQueryKey } from "@/lib/api-client";

const TRAINS: [string, string, string, string][] = [
  ["12301", "Howrah Rajdhani Express", "HWH", "NDLS"],
  ["12002", "New Delhi Bhopal Shatabdi", "NDLS", "BPL"],
  ["12951", "Mumbai Rajdhani Express", "MMCT", "NDLS"],
];
const STATIONS: [string, string][] = [
  ["NDLS", "New Delhi"], ["HWH", "Howrah Junction"],
  ["MMCT", "Mumbai Central"], ["CNB", "Kanpur Central"], ["BPL", "Bhopal Junction"],
];

const RECENT_KEY = "rr_recent";
const MAX_RECENT = 5;

interface RecentEntry { type: "train" | "station"; id: string; label: string; subtitle?: string }

function loadRecent(): RecentEntry[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}
function saveRecent(entry: RecentEntry) {
  const prev = loadRecent().filter(r => !(r.type === entry.type && r.id === entry.id));
  localStorage.setItem(RECENT_KEY, JSON.stringify([entry, ...prev].slice(0, MAX_RECENT)));
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = "RailRoute"; }, []);
  useEffect(() => { setRecent(loadRecent()); }, []);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading } = useSearch(
    { q: debounced },
    { query: { enabled: debounced.length > 1, queryKey: getSearchQueryKey({ q: debounced }) } }
  );

  const go = (type: "train" | "station", id: string, label: string, subtitle?: string) => {
    saveRecent({ type, id, label, subtitle });
    setQuery(""); setOpen(false);
    setLocation(`/${type}/${id}`);
  };

  const hasResults = data && (data.trains.length > 0 || data.stations.length > 0);
  const showRecent = open && debounced.length <= 1 && recent.length > 0;
  const showResults = open && debounced.length > 1;

  const trainsResults = data?.trains ?? [];
  const stationsResults = data?.stations ?? [];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 pb-16 overflow-y-auto">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">RailRoute</h1>
          <p className="text-xs text-muted-foreground mt-1">Indian Railways — positions computed from timetable</p>
        </div>

        <div className="relative mb-8">
          <div className={`flex items-center h-10 rounded-md border bg-white shadow-sm transition-shadow ${open ? "ring-2 ring-primary/25 border-primary" : "border-border"}`}>
            <svg className="w-4 h-4 ml-3 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 160)}
              onKeyDown={e => e.key === "Escape" && (setQuery(""), setOpen(false))}
              placeholder="Train number or station name…"
              className="flex-1 h-full bg-transparent px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
              autoComplete="off"
            />
            {query && (
              <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="mr-3 text-muted-foreground hover:text-foreground">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {(showRecent || showResults) && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-border rounded-md shadow-lg overflow-hidden z-50">
              {showRecent && (
                <>
                  <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent</span>
                    <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                      className="text-[10px] text-muted-foreground hover:text-foreground">Clear</button>
                  </div>
                  {recent.map(r => (
                    <button key={`${r.type}-${r.id}`} onMouseDown={() => go(r.type, r.id, r.label, r.subtitle)}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent text-left">
                      <span className="text-muted-foreground shrink-0">
                        {r.type === "train"
                          ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="4" y="4" width="16" height="12" rx="2" /><path d="M8 16v4M16 16v4M4 8h16" /></svg>
                          : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="2" /></svg>
                        }
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-foreground truncate">{r.label}</div>
                        {r.subtitle && <div className="text-[11px] text-muted-foreground truncate">{r.subtitle}</div>}
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground shrink-0">{r.id}</span>
                    </button>
                  ))}
                </>
              )}
              {showResults && (
                <>
                  {isLoading && (
                    <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-muted-foreground">
                      <div className="w-3 h-3 border-2 border-border border-t-primary rounded-full animate-spin" />Searching…
                    </div>
                  )}
                  {!isLoading && !hasResults && <div className="px-4 py-3 text-[13px] text-muted-foreground">No results for "{debounced}"</div>}
                  {!isLoading && hasResults && (
                    <>
                      {trainsResults.length > 0 && (
                        <>
                          <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Trains</div>
                          {trainsResults.map(t => (
                            <button key={t.id} onMouseDown={() => go("train", t.id, t.name, t.subtitle ?? "")}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent text-left">
                              <span className="font-mono text-xs font-semibold text-primary w-10 shrink-0">{t.id}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] text-foreground truncate">{t.name}</div>
                                {t.subtitle && <div className="text-[11px] text-muted-foreground">{t.subtitle}</div>}
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                      {stationsResults.length > 0 && (
                        <>
                          {trainsResults.length > 0 && <div className="border-t border-border" />}
                          <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stations</div>
                          {stationsResults.map(s => (
                            <button key={s.id} onMouseDown={() => go("station", s.id, s.name)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent text-left">
                              <span className="font-mono text-xs font-semibold text-muted-foreground w-10 shrink-0">{s.id}</span>
                              <span className="text-[13px] text-foreground truncate">{s.name}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Trains</p>
          <div className="bg-white border border-border rounded-md overflow-hidden shadow-sm divide-y divide-border">
            {TRAINS.map(([id, name, src, dst]) => (
              <button key={id} onClick={() => go("train", id, name, `${src} → ${dst}`)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors">
                <span className="font-mono text-[12px] font-semibold text-primary w-10 shrink-0">{id}</span>
                <span className="flex-1 text-[13px] text-foreground">{name}</span>
                <span className="font-mono text-[11px] text-muted-foreground shrink-0">{src} → {dst}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Stations</p>
          <div className="flex flex-wrap gap-2">
            {STATIONS.map(([id, name]) => (
              <button key={id} onClick={() => go("station", id, name)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded hover:bg-accent transition-colors shadow-sm">
                <span className="font-mono text-[11px] font-semibold text-muted-foreground">{id}</span>
                <span className="text-[12px] text-foreground">{name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
