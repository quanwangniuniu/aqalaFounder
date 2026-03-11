"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, UserProfile } from "@/lib/firebase/users";
import {
  getReports,
  updateReportStatus,
  Report,
  ReportStatus,
  REPORT_REASONS,
} from "@/lib/firebase/moderation";

type FilterTab = "pending" | "reviewed" | "all";

export default function ModerationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<string, UserProfile | null>>({});

  // Check admin access
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    getUserProfile(user.uid).then((profile) => {
      if (!profile?.admin) {
        router.push("/");
        return;
      }
      setIsAdmin(true);
    });
  }, [user, authLoading, router]);

  // Load reports
  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const status = activeFilter === "all" ? undefined : (activeFilter as ReportStatus);
      const data = await getReports(status);
      setReports(data);

      // Pre-fetch user profiles for reports
      const userIds = new Set<string>();
      data.forEach((r) => {
        userIds.add(r.reporterId);
        userIds.add(r.targetUserId);
      });

      const newCache: Record<string, UserProfile | null> = { ...userCache };
      const fetchPromises = Array.from(userIds)
        .filter((id) => !(id in newCache))
        .map(async (id) => {
          try {
            newCache[id] = await getUserProfile(id);
          } catch {
            newCache[id] = null;
          }
        });
      await Promise.all(fetchPromises);
      setUserCache(newCache);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (isAdmin) loadReports();
  }, [isAdmin, loadReports]);

  const handleAction = async (reportId: string, status: ReportStatus, resolution?: string) => {
    if (!user) return;
    setActionLoading(reportId);
    try {
      await updateReportStatus(reportId, status, user.uid, resolution);
      await loadReports();
    } catch (err) {
      console.error("Failed to update report:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getReasonLabel = (reason: string) =>
    REPORT_REASONS.find((r) => r.value === reason)?.label || reason;

  const getUserDisplay = (userId: string) => {
    const profile = userCache[userId];
    if (!profile) return { name: "Unknown User", photo: null, username: null };
    return {
      name: profile.displayName || profile.username || "User",
      photo: profile.photoURL,
      username: profile.username,
    };
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold">Content Moderation</h1>
          <span className="ml-auto text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
            {reports.length} report{reports.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-5 space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["pending", "reviewed", "all"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeFilter === tab
                  ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
                  : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/50 text-sm">No {activeFilter !== "all" ? activeFilter : ""} reports</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const reporter = getUserDisplay(report.reporterId);
              const target = getUserDisplay(report.targetUserId);
              const isActionLoading = actionLoading === report.id;

              return (
                <div
                  key={report.id}
                  className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden"
                >
                  {/* Report header */}
                  <div className="p-4 space-y-3">
                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          report.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : report.status === "resolved"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : report.status === "dismissed"
                            ? "bg-white/5 text-white/50 border border-white/10"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      <span className="text-xs text-white/30">
                        {report.createdAt.toLocaleDateString()} {report.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {/* Reason */}
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Reason</p>
                      <p className="text-sm text-white font-medium">{getReasonLabel(report.reason)}</p>
                    </div>

                    {/* Description */}
                    {report.description && (
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Details</p>
                        <p className="text-sm text-white/70">{report.description}</p>
                      </div>
                    )}

                    {/* Users */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Reporter */}
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Reported by</p>
                        <Link
                          href={`/user/${report.reporterId}`}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          {reporter.photo ? (
                            <Image src={reporter.photo} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-xs text-[#D4AF37] font-semibold">
                              {reporter.name[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-white truncate">{reporter.name}</p>
                            {reporter.username && (
                              <p className="text-[10px] text-white/40 truncate">@{reporter.username}</p>
                            )}
                          </div>
                        </Link>
                      </div>

                      {/* Target */}
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Reported user</p>
                        <Link
                          href={`/user/${report.targetUserId}`}
                          className="flex items-center gap-2 p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-colors border border-red-500/10"
                        >
                          {target.photo ? (
                            <Image src={target.photo} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-400 font-semibold">
                              {target.name[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-white truncate">{target.name}</p>
                            {target.username && (
                              <p className="text-[10px] text-white/40 truncate">@{target.username}</p>
                            )}
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Resolution note */}
                    {report.resolution && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-white/40 mb-1">Resolution</p>
                        <p className="text-sm text-white/70">{report.resolution}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions for pending reports */}
                  {report.status === "pending" && (
                    <div className="flex border-t border-white/5">
                      <button
                        onClick={() => handleAction(report.id, "resolved", "Action taken against reported user")}
                        disabled={isActionLoading}
                        className="flex-1 py-3 text-sm font-medium text-green-400 hover:bg-green-500/5 transition-colors disabled:opacity-50 border-r border-white/5"
                      >
                        {isActionLoading ? "..." : "Resolve"}
                      </button>
                      <button
                        onClick={() => handleAction(report.id, "dismissed", "Report dismissed after review")}
                        disabled={isActionLoading}
                        className="flex-1 py-3 text-sm font-medium text-white/50 hover:bg-white/5 transition-colors disabled:opacity-50"
                      >
                        {isActionLoading ? "..." : "Dismiss"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
