export default function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center gap-3 text-muted-foreground">
      <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
      <span className="text-[13px]">{message}</span>
    </div>
  );
}
