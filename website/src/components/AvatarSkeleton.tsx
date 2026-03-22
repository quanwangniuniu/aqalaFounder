/**
 * Tailwind pulse placeholder for profile avatar while auth or image loads.
 */
export default function AvatarSkeleton({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div
      className={`shrink-0 rounded-full bg-white/15 animate-pulse ring-1 ring-white/10 ${className}`}
      aria-busy="true"
      aria-label="Loading profile"
    />
  );
}
