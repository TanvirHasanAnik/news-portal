import React from "react";
import { ShieldCheck, History } from "lucide-react";
import { formatStaticDateTime } from "@/utils/dateUtils";

export function AuditLogsTable({ logs }) {
  const getActionLabel = (action) => {
    switch (action) {

      case "create_user":
        return { label: "নতুন ব্যবহারকারী", color: "text-purple-700 bg-purple-50 border border-purple-200" };
      case "update_user_role":
        return { label: "রোল পরিবর্তন", color: "text-amber-700 bg-amber-50 border border-amber-200" };
      case "disable_user":
        return { label: "ব্যবহারকারী নিষ্ক্রিয়", color: "text-rose-700 bg-rose-50 border border-rose-200" };
      case "enable_user":
        return { label: "ব্যবহারকারী সক্রিয়", color: "text-teal-700 bg-teal-50 border border-teal-200" };
      case "admin_reset_user_password":
      case "override_password":
      case "change_password":
        return { label: "পাসওয়ার্ড পরিবর্তন", color: "text-orange-700 bg-orange-50 border border-orange-200" };
      case "submit_admin_request":
        return { label: "আবেদন জমাদান", color: "text-indigo-700 bg-indigo-50 border border-indigo-200" };
      case "approve_request":
        return { label: "আবেদন অনুমোদন", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };
      case "reject_request":
        return { label: "আবেদন প্রত্যাখ্যান", color: "text-rose-700 bg-rose-50 border border-rose-200" };

      case "add_curation":
        return { label: "কিউরেশন যুক্ত", color: "text-blue-700 bg-blue-50 border border-blue-200" };
      case "batch_update_curation":
        return { label: "কিউরেশন আপডেট", color: "text-blue-700 bg-blue-50 border border-blue-200" };
      case "remove_curation":
        return { label: "কিউরেশন অপসারণ", color: "text-slate-700 bg-slate-100 border border-slate-200" };

      case "batch_update_categories":
      case "create_category":
      case "update_category":
      case "delete_category":
      case "create_subcategory":
      case "update_subcategory":
      case "delete_subcategory":
        return { label: "ক্যাটাগরি ও সাবক্যাটাগরি", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };

      default:
        return { label: action, color: "text-slate-600 bg-slate-50 border border-slate-200" };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900">কিউরেশন, ক্যাটাগরি ও ব্যবহারকারী অডিট লগ</h2>
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
                  এখনো কোনো কিউরেশন, ক্যাটাগরি বা ব্যবহারকারী কার্যক্রম রেকর্ড করা হয়নি।
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
                    else if (parsed.type) {
                      const typeLabel = parsed.type === "breaking" ? "জরুরি খবর" : parsed.type === "handpicked" ? "বাছাইকৃত খবর" : parsed.type;
                      detailsText = `কিউরেশন টাইপ: ${typeLabel} ${parsed.count ? `(${parsed.count}টি)` : ""}`;
                    }
                    else if (parsed.status) detailsText = `অবস্থা: ${parsed.status}`;
                    else if (parsed.requestType) detailsText = `আবেদনের ধরণ: ${parsed.requestType}`;
                    else if (parsed.count) detailsText = `${parsed.count}টি আইটেম হালনাগাদ`;
                    else detailsText = Object.values(parsed).filter(v => typeof v === "string" || typeof v === "number").join(", ");
                  } catch {
                    detailsText = log.details;
                  }
                }

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-900">
                      @{log.user_name || "admin"}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-500 font-medium">
                      {detailsText || "প্রশাসনিক কার্যক্রম"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {formatStaticDateTime(log.created_at)}
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

