
export default function AdminLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">

      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-300 rounded-md" />
          <div className="h-3.5 w-64 bg-slate-200 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-slate-200 rounded-md" />
          <div className="h-9 w-28 bg-slate-200 rounded-md" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pb-4 border-b border-slate-100">
          <div className="h-9 w-full sm:w-72 bg-slate-200 rounded-md" />
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="h-9 w-32 bg-slate-200 rounded-md" />
            <div className="h-9 w-28 bg-slate-200 rounded-md" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center px-4 justify-between"
            >
              <div className="h-4 w-1/3 bg-slate-200 rounded" />
              <div className="h-4 w-1/5 bg-slate-200 rounded hidden sm:block" />
              <div className="h-4 w-1/6 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
