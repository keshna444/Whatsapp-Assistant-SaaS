import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../components/ui";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

export type WorkingHoursData = Record<DayKey, { open: string; close: string; closed: boolean }>;

export const DEFAULT_HOURS: WorkingHoursData = {
  mon: { open: "09:00", close: "18:00", closed: false },
  tue: { open: "09:00", close: "18:00", closed: false },
  wed: { open: "09:00", close: "18:00", closed: false },
  thu: { open: "09:00", close: "18:00", closed: false },
  fri: { open: "09:00", close: "18:00", closed: false },
  sat: { open: "10:00", close: "14:00", closed: false },
  sun: { open: "00:00", close: "00:00", closed: true },
};

interface Props {
  value: WorkingHoursData;
  onChange: (data: WorkingHoursData) => void;
}

export function WorkingHours({ value, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  const update = (day: DayKey, field: "open" | "close" | "closed", val: string | boolean) => {
    onChange({ ...value, [day]: { ...value[day], [field]: val } });
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
      >
        <span>Set working hours (optional)</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="divide-y divide-slate-100">
          {DAYS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3 px-4 py-2.5 flex-wrap">
              <span className="w-24 text-sm text-slate-600 shrink-0">{label}</span>

              {value[key].closed ? (
                <span className="text-sm text-slate-400 flex-1">Closed</span>
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="time"
                    value={value[key].open}
                    onChange={(e) => update(key, "open", e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] w-28"
                  />
                  <span className="text-slate-400 text-sm">–</span>
                  <input
                    type="time"
                    value={value[key].close}
                    onChange={(e) => update(key, "close", e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] w-28"
                  />
                </div>
              )}

              <label
                className={cn(
                  "flex items-center gap-1.5 text-xs text-slate-500 shrink-0 cursor-pointer select-none ml-auto"
                )}
              >
                <input
                  type="checkbox"
                  checked={value[key].closed}
                  onChange={(e) => update(key, "closed", e.target.checked)}
                  className="accent-[#25D366]"
                />
                Closed
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
