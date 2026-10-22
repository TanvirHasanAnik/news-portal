import React from "react";
import { ShieldCheck, History } from "lucide-react";
import { formatTimeAgo } from "@/utils/dateUtils";

export function AuditLogsTable({ logs }) {
  const getActionLabel = (action) => {
    switch (action) {
      case "create_article":
        return { label: "সংবাদ তৈরি", color: "text-emerald-700 bg-emerald-50" };
      case "update_status":
        return { label: "স্ট্যাটাস পরিবর্তন", color: "text-blue-700 bg-blue-50" };
      case "create_user":
        return { label: "ব্যবহারকারী যুক্ত", color: "text-purple-700 bg-purple-50" };
      case "update_user_role":
        return { label: "রোল পরিবর্তন", color: "text-amber-700 bg-amber-50" };
      case "disable_user":
        return { label: "ব্যবহারকারী নিষ্ক্রিয়", color: "text-red-700 bg-red-50" };
      case "enable_user":
        return { label: "ব্যবহারকারী সক্রিয়", color: "text-teal-700 bg-teal-50" };
      case "submit_admin_request":
        return { label: "আবেদন জমাদান", color: "text-indigo-700 bg-indigo-50" };
      case "approve_request":
        return { label: "আবেদন অনুমোদন", color: "text-emerald-700 bg-emerald-50" };
      case "reject_request":
        return { label: "আবেদন প্রত্যাখ্যান", color: "text-rose-700 bg-rose-50" };
      case "add_curation":
        return { label: "কিউরেশন সংযোজন", color: "text-slate-700 bg-slate-100" };
      default:
        return { label: action, color: "text-slate-600 bg-slate-50" };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900">প্রশাসনিক অডিট লগ (Audit Trail)</h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          নিরাপত্তা ট্র্যাকিং
        </div>
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-medium">
              <th className="py-2.5 px-3">অ্যাকশন</th>
              <th className="py-2.5 px-3">ব্যবহারকারী</th>
              <th className="py-2.5 px-3">বিবরণ</th>
              <th className="py-2.5 px-3 text-right">সময়</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-slate-400">
                  এখনো কোনো প্রশাসনিক কার্যক্রম রেকর্ড করা হয়নি।
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const badge = getActionLabel(log.action);
                let detailsText = "";
                if (log.details) {
                  try {
                    const parsed = JSON.parse(log.details);
                    if (parsed.headline) detailsText = parsed.headline;
                    else if (parsed.name) detailsText = `${parsed.name} (${parsed.role || ""})`;
                    else if (parsed.status) detailsText = `নতুন অবস্থা: ${parsed.status}`;
                    else if (parsed.requestType) detailsText = `ধরণ: ${parsed.requestType}`;
                    else detailsText = Object.values(parsed).filter(v => typeof v === "string").join(", ");
                  } catch {
                    detailsText = log.details;
                  }
                }

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-900">
                      {log.user_name || "সিস্টেম অ্যাডমিন"}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-500">
                      {detailsText || "সাধারণ কার্যক্রম"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(log.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

