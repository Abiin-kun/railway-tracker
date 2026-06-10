export default function ErrorState({
  message = "Something went wrong",
  onRetry,
}: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
      <p className="text-[13px] text-foreground">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-[12px] text-primary hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
