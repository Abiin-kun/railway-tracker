export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <p className="text-[13px] font-medium text-muted-foreground/60 mb-1">{title}</p>
      {description && (
        <p className="text-[12px] text-muted-foreground/40 max-w-xs">{description}</p>
      )}
    </div>
  );
}
