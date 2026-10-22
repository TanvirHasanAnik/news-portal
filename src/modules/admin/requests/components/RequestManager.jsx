"use client";

import React, { useState, useTransition } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  X,
  UserPlus,
  UserX,
  ShieldAlert,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAdminRequestAction,
  updateAdminRequestStatusAction,
} from "@/actions/requestActions";
import { ROLE_LABELS, USER_ROLES } from "@/lib/auth";
import { formatTimeAgo } from "@/utils/dateUtils";

export function RequestManager({ initialRequests = [], users = [] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [activeStatus, setActiveStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);

  // New Request Form State
  const [requestType, setRequestType] = useState("new_user");
  const [targetUserId, setTargetUserId] = useState("");
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqRole, setReqRole] = useState(USER_ROLES.REPORTER);
  const [note, setNote] = useState("");

  const filteredRequests = requests.filter((r) => {
    if (activeStatus !== "all" && r.status !== activeStatus) return false;
    return true;
  });

  const handleCreateRequest = (e) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.append("requestType", requestType);
      formData.append("targetUserId", targetUserId);
      formData.append("requestedName", reqName);
      formData.append("requestedEmail", reqEmail);
      formData.append("requestedRole", reqRole);
      formData.append("note", note);

      const res = await createAdminRequestAction(null, formData);
      if (res.success) {
        setRequests((prev) => [
          {
            id: `req_${Date.now()}`,
            requester_name: "অ্যাডমিন",
            request_type: requestType,
            status: "pending",
            payload: JSON.stringify({ note, name: reqName, email: reqEmail, newRole: reqRole }),
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setFeedback({ type: "success", message: res.message });
        setShowCreateModal(false);
        setNote("");
        setReqName("");
        setReqEmail("");
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleUpdateStatus = (id, newStatus) => {
    const actionLabel = newStatus === "approved" ? "অনুমোদন" : "প্রত্যাখ্যান";
    const reviewerNote = prompt(`আবেদনের জন্য মন্তব্য লিখুন (ঐচ্ছিক):`, "");
    if (reviewerNote === null) return;

    startTransition(async () => {
      const res = await updateAdminRequestStatusAction(id, newStatus, reviewerNote);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: newStatus, reviewer_note: reviewerNote } : r
          )
        );
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const getRequestTypeDetails = (type) => {
    switch (type) {
      case "new_user":
        return { label: "নতুন সদস্য আবেদন", icon: UserPlus, color: "text-blue-700 bg-blue-50" };
      case "disable_user":
        return { label: "সদস্য নিষ্ক্রিয় আবেদন", icon: UserX, color: "text-red-700 bg-red-50" };
      case "role_change":
        return { label: "রোল পরিবর্তন আবেদন", icon: ShieldAlert, color: "text-purple-700 bg-purple-50" };
      default:
        return { label: "সাধারণ আবেদন", icon: Send, color: "text-slate-700 bg-slate-50" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>×</button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "সকল" },
            { id: "pending", label: "অপেক্ষমান" },
            { id: "approved", label: "অনুমোদিত" },
            { id: "rejected", label: "প্রত্যাখ্যাত" },
          ].map((tab) => {
            const isActive = activeStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Submit request button for Admins */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8.5 gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          নতুন আবেদন জমা দিন
        </Button>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            এই ক্যাটাগরিতে কোনো আবেদন পাওয়া যায়নি।
          </div>
        ) : (
          filteredRequests.map((req) => {
            const typeInfo = getRequestTypeDetails(req.request_type);
            const Icon = typeInfo.icon;

            let parsedPayload = {};
            if (req.payload) {
              try {
                parsedPayload = JSON.parse(req.payload);
              } catch {}
            }

            return (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${typeInfo.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {typeInfo.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        প্রেরক: <strong className="text-slate-700">{req.requester_name || "অ্যাডমিন"}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400">
                        {formatTimeAgo(req.created_at)}
                      </span>
                    </div>

                    {/* Details note */}
                    <div className="text-xs text-slate-600">
                      {req.target_user_name && (
                        <p>
                          টার্গেট সদস্য: <span className="font-semibold text-slate-800">{req.target_user_name}</span> ({req.target_user_email})
                        </p>
                      )}
                      {parsedPayload.name && (
                        <p>
                          প্রস্তাবিত নাম: <strong>{parsedPayload.name}</strong> ({parsedPayload.email}) - পদবী: {ROLE_LABELS[parsedPayload.newRole] || parsedPayload.newRole}
                        </p>
                      )}
                      {parsedPayload.newRole && !parsedPayload.name && (
                        <p>
                          প্রস্তাবিত নতুন রোল: <strong>{ROLE_LABELS[parsedPayload.newRole] || parsedPayload.newRole}</strong>
                        </p>
                      )}
                      {parsedPayload.note && (
                        <p className="text-slate-500 italic mt-0.5">
                          " {parsedPayload.note} "
                        </p>
                      )}
                      {req.reviewer_note && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded mt-1">
                          পর্যালোচনা নোট: {req.reviewer_note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Review Buttons */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  {req.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(req.id, "approved")}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        অনুমোদন
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(req.id, "rejected")}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        প্রত্যাখ্যান
                      </button>
                    </>
                  ) : req.status === "approved" ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      অনুমোদিত
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="w-3 h-3" />
                      প্রত্যাখ্যাত
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                সুপার অ্যাডমিনের নিকট নতুন আবেদন
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আবেদনের ধরণ
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="new_user">নতুন সদস্য যুক্ত করার আবেদন</option>
                  <option value="role_change">সদস্যের রোল পরিবর্তনের আবেদন</option>
                  <option value="disable_user">সদস্য নিষ্ক্রিয় করার আবেদন</option>
                  <option value="curation_change">কিউরেশন পরিবর্তনের আবেদন</option>
                </select>
              </div>

              {requestType === "new_user" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      প্রস্তাবিত সদস্যের নাম
                    </label>
                    <Input
                      type="text"
                      placeholder="নাম লিখুন"
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ইমেইল
                    </label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      পদবী (Role)
                    </label>
                    <select
                      value={reqRole}
                      onChange={(e) => setReqRole(e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {Object.entries(ROLE_LABELS).map(([k, l]) => (
                        <option key={k} value={k}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {(requestType === "disable_user" || requestType === "role_change") && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      সদস্য নির্বাচন করুন
                    </label>
                    <select
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      required
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="">-- সদস্য নির্বাচন করুন --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  {requestType === "role_change" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        প্রস্তাবিত নতুন রোল
                      </label>
                      <select
                        value={reqRole}
                        onChange={(e) => setReqRole(e.target.value)}
                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        {Object.entries(ROLE_LABELS).map(([k, l]) => (
                          <option key={k} value={k}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আবেদনের কারণ বা বিস্তারিত নোট
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="অনুরোধের কারণ উল্লেখ করুন..."
                  className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  আবেদন জমা দিন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

