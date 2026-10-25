"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ROLE_LABELS, USER_ROLES, ASSIGNABLE_ROLE_LABELS, isSingleUserRole } from "@/lib/auth";
import { usePermissions } from "@/contexts/AuthContext";
import { formatTimeAgo } from "@/utils/dateUtils";
import { createAdminRequestSchema } from "@/schemas/requestSchema";

export function RequestManager({
  initialRequests = [],
  users = [],
  canReview: propCanReview,
  canCreate: propCanCreate,
}) {
  const { can } = usePermissions();

  // Policy-based RBAC permission checks (overridable via props)
  const canReviewRequests = propCanReview !== undefined ? propCanReview : can("requests:review");
  const canCreateRequest = propCanCreate !== undefined ? propCanCreate : can("requests:create");

  const [requests, setRequests] = useState(initialRequests);
  const [activeStatus, setActiveStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(null);

  // Initialize React Hook Form with real-time validation via Zod
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createAdminRequestSchema),
    mode: "onChange",
    defaultValues: {
      requestType: "new_user",
      targetUserId: "",
      requestedName: "",
      requestedEmail: "",
      requestedRole: USER_ROLES.REPORTER,
      note: "",
    },
  });

  const requestType = watch("requestType");

  const filteredRequests = requests.filter((r) => {
    if (activeStatus !== "all" && r.status !== activeStatus) return false;
    return true;
  });

  const onCreateRequest = (data) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("requestType", data.requestType);
      formData.append("targetUserId", data.targetUserId || "");
      formData.append("requestedName", data.requestedName || "");
      formData.append("requestedEmail", data.requestedEmail || "");
      formData.append("requestedRole", data.requestedRole || "");
      formData.append("note", data.note.trim());

      const res = await createAdminRequestAction(null, formData);
      if (res.success) {
        setRequests((prev) => [
          {
            id: `req_${Date.now()}`,
            requester_name: "অ্যাডমিন",
            request_type: data.requestType,
            status: "pending",
            payload: JSON.stringify({
              note: data.note,
              name: data.requestedName,
              email: data.requestedEmail,
              newRole: data.requestedRole,
            }),
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setFeedback({ type: "success", message: res.message });
        setShowCreateModal(false);
        reset();
      } else {
        setFeedback({ type: "error", message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleUpdateStatus = (id, newStatus) => {
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

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="cursor-pointer">×</button>
        </div>
      )}

      {/* Action Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveStatus("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeStatus === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            সবগুলো ({requests.length})
          </button>
          <button
            onClick={() => setActiveStatus("pending")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeStatus === "pending"
                ? "bg-white text-amber-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            অপেক্ষমাণ ({requests.filter((r) => r.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveStatus("approved")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeStatus === "approved"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            অনুমোদিত ({requests.filter((r) => r.status === "approved").length})
          </button>
          <button
            onClick={() => setActiveStatus("rejected")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeStatus === "rejected"
                ? "bg-white text-red-600 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            প্রত্যাখ্যাত ({requests.filter((r) => r.status === "rejected").length})
          </button>
        </div>

        {canCreateRequest && (
          <Button
            onClick={() => {
              reset();
              setShowCreateModal(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            নতুন আবেদন জমা দিন
          </Button>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            এই ফিল্টারে কোনো আবেদন পাওয়া যায়নি।
          </div>
        ) : (
          filteredRequests.map((req) => {
            let parsedPayload = {};
            try {
              parsedPayload = JSON.parse(req.payload || "{}");
            } catch {}

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                      req.request_type === "new_user"
                        ? "bg-blue-50 text-blue-600"
                        : req.request_type === "disable_user"
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {req.request_type === "new_user" ? (
                      <UserPlus className="w-5 h-5" />
                    ) : req.request_type === "disable_user" ? (
                      <UserX className="w-5 h-5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {req.request_type === "new_user"
                          ? "নতুন সদস্য যোগের আবেদন"
                          : req.request_type === "disable_user"
                          ? "সদস্য নিষ্ক্রিয় করার আবেদন"
                          : req.request_type === "role_change"
                          ? "দায়িত্ব/রোল পরিবর্তনের আবেদন"
                          : "সাধারণ কিউরেশন আবেদন"}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(req.created_at)}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-slate-600 space-y-0.5">
                      {parsedPayload.name && (
                        <p>
                          সদস্যের নাম: <strong className="text-slate-900">{parsedPayload.name}</strong> ({parsedPayload.email || "ইমেইল নেই"})
                        </p>
                      )}
                      {parsedPayload.newRole && (
                        <p>
                          প্রস্তাবিত রোল: <strong>{ROLE_LABELS[parsedPayload.newRole] || parsedPayload.newRole}</strong>
                        </p>
                      )}
                      {parsedPayload.note && (
                        <p className="text-slate-500 italic mt-0.5">
                          &ldquo;{parsedPayload.note}&rdquo;
                        </p>
                      )}
                      {req.reviewer_note && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded mt-1">
                          মন্তব্য: {req.reviewer_note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Review Buttons */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  {req.status === "pending" ? (
                    canReviewRequests ? (
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
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        সুপার অ্যাডমিনের সিদ্ধান্তের অপেক্ষায়
                      </span>
                    )
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

      {/* New Request Modal with React Hook Form Real-time Validation */}
      {showCreateModal && canCreateRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                নতুন আবেদন
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreateRequest)} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আবেদনের ধরণ <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("requestType")}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="new_user">নতুন সদস্য যুক্ত করার আবেদন</option>
                  <option value="role_change">সদস্যের রোল পরিবর্তনের আবেদন</option>
                  <option value="disable_user">সদস্য নিষ্ক্রিয় করার আবেদন</option>
                  <option value="curation_change">কিউরেশন পরিবর্তনের আবেদন</option>
                </select>
                {errors.requestType && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.requestType.message}</p>
                )}
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
                      {...register("requestedName")}
                      className={`text-xs h-9 ${errors.requestedName ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {errors.requestedName && (
                      <p className="text-[11px] text-red-500 font-medium mt-1">{errors.requestedName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ইমেইল
                    </label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...register("requestedEmail")}
                      className={`text-xs h-9 ${errors.requestedEmail ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {errors.requestedEmail && (
                      <p className="text-[11px] text-red-500 font-medium mt-1">{errors.requestedEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      পদবী বা দায়িত্ব
                    </label>
                    <select
                      {...register("requestedRole")}
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {Object.entries(ASSIGNABLE_ROLE_LABELS).map(([k, l]) => (
                        <option key={k} value={k}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {(requestType === "role_change" || requestType === "disable_user") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সদস্য নির্বাচন করুন
                  </label>
                  <select
                    {...register("targetUserId")}
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">-- সদস্য নির্বাচন করুন --</option>
                    {users
                      .filter((u) => !isSingleUserRole(u.role))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) [{ROLE_LABELS[u.role] || u.role}]
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {requestType === "role_change" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    নতুন প্রস্তাবিত পদবী (Role)
                  </label>
                  <select
                    {...register("requestedRole")}
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {Object.entries(ASSIGNABLE_ROLE_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আবেদনের যৌক্তিকতা বা বিবরণ <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="আবেদনের কারণ বা মন্তব্য লিখুন..."
                  {...register("note")}
                  className={`w-full rounded-md border bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 ${
                    errors.note ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-slate-900"
                  }`}
                />
                {errors.note && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.note.message}</p>
                )}
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
                  className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isPending ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
