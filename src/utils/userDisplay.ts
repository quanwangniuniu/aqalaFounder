import { User } from "@/types/auth";

/**
 * Get a user-friendly display name for a user
 * Priority: displayName > email (full) > formatted userId > "Unknown User"
 */
export function getUserDisplayName(user: User | null, userId?: string, email?: string | null): string {
  if (user?.displayName) {
    return user.displayName;
  }
  // Show full email if available (from user object or parameter)
  const userEmail = user?.email || email;
  if (userEmail) {
    return userEmail;
  }
  if (userId) {
    return `User ${userId.slice(0, 8)}...`;
  }
  return "Unknown User";
}

/**
 * Get user initials for avatar display
 */
export function getUserInitials(user: User | null, userId?: string): string {
  if (user?.displayName) {
    const parts = user.displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.displayName.charAt(0).toUpperCase();
  }
  if (user?.email) {
    return user.email.charAt(0).toUpperCase();
  }
  if (userId) {
    return userId.charAt(0).toUpperCase();
  }
  return "?";
}

