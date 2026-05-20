import { Trash2 } from "lucide-react";
import { Input } from "../../components/ui";

export interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
}

interface Props {
  services: Service[];
  onChange: (services: Service[]) => void;
  currencySymbol: string;
  errors?: Record<string, string>;
}

export function ServicesRepeater({ services, onChange, currencySymbol, errors = {} }: Props) {
  const addService = () => {
    if (services.length >= 20) return;
    onChange([
      ...services,
      { id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, name: "", price: "", duration: "" },
    ]);
  };

  const removeService = (id: string) => {
    onChange(services.filter((s) => s.id !== id));
  };

  const updateService = (id: string, field: keyof Omit<Service, "id">, value: string) => {
    onChange(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">Your services</label>

      {/* Column headers — desktop only */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_7rem_7.5rem_2.5rem] gap-2 text-xs font-medium text-slate-400 pb-0.5">
        <span>Service name</span>
        <span>Price ({currencySymbol})</span>
        <span>Duration (min)</span>
        <span />
      </div>

      <div className="space-y-3 sm:space-y-2">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="grid grid-cols-1 sm:grid-cols-[1fr_7rem_7.5rem_2.5rem] gap-2 items-start"
          >
            {/* Service name */}
            <div>
              <label className="sm:hidden text-xs text-slate-400 mb-1 block">Service name</label>
              <Input
                placeholder="e.g. Gel Manicure"
                value={svc.name}
                onChange={(e) => updateService(svc.id, "name", e.target.value)}
                error={errors[`${svc.id}_name`]}
                style={{ fontSize: 16 }}
              />
            </div>

            {/* Price */}
            <div>
              <label className="sm:hidden text-xs text-slate-400 mb-1 block">
                Price ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none select-none">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={svc.price}
                  onChange={(e) => updateService(svc.id, "price", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent pl-8 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  style={{ fontSize: 16 }}
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="sm:hidden text-xs text-slate-400 mb-1 block">Duration (min)</label>
              <input
                type="number"
                min="1"
                placeholder="45"
                value={svc.duration}
                onChange={(e) => updateService(svc.id, "duration", e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                style={{ fontSize: 16 }}
              />
            </div>

            {/* Delete */}
            <div className="flex items-center h-10">
              {services.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeService(svc.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  aria-label="Remove service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <span className="w-6" />
              )}
            </div>
          </div>
        ))}
      </div>

      {services.length < 20 && (
        <button
          type="button"
          onClick={addService}
          className="text-sm text-[#25D366] hover:text-[#1fae54] font-medium transition-colors mt-1"
        >
          + Add another service
        </button>
      )}
    </div>
  );
}
