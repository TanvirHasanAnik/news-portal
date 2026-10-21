import React from "react";

export default function ArticleCreateHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif-bangla">
            নতুন আর্টিকেল তৈরি করুন
          </h1>
        </div>
      </div>
    </div>
  );
}

