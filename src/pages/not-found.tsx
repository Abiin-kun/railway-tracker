import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <p className="font-mono text-[64px] font-bold text-muted-foreground/15 leading-none mb-4">
        404
      </p>
      <p className="text-[14px] font-medium text-foreground/60 mb-1">
        Page not found
      </p>
      <p className="text-[12px] text-muted-foreground/40 mb-6">
        This route doesn't exist in the router.
      </p>
      <Link
        href="/"
        className="text-[12px] font-medium text-primary/70 hover:text-primary transition-colors border border-primary/20 hover:border-primary/40 px-4 py-2 rounded-lg"
      >
        Back to Home
      </Link>
    </div>
  );
}
