import type { Room } from "@/lib/firebase/rooms";

/**
 * Product analytics room_type (public | private). App rooms are community/partner streams → public.
 */
export function roomTypeForAnalytics(_room: Room | null | undefined): "public" | "private" {
  void _room;
  return "public";
}
