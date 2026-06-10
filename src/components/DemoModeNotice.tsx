export default function DemoModeNotice() {
  return (
    <div className="fixed bottom-4 right-5 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/8 border border-amber-500/15 backdrop-blur-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0" />
      <span className="text-[10px] font-medium text-amber-500/60 whitespace-nowrap">Demo mode</span>
    </div>
  );
}
