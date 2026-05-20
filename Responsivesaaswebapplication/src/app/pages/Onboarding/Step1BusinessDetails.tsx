import { useState, useEffect } from "react";
import { Button, Input } from "../../components/ui";
import { WorkingHours, WorkingHoursData, DEFAULT_HOURS } from "./WorkingHours";
import { ServicesRepeater, Service } from "./ServicesRepeater";

const BUSINESS_TYPES = [
  "Hair Salon",
  "Nail Studio",
  "Barbershop",
  "Dental Clinic",
  "Massage Studio",
  "Other",
];

const CURRENCY_OPTIONS = [
  { code: "MUR", symbol: "Rs", label: "Mauritian Rupee (Rs)" },
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "GBP", symbol: "£", label: "British Pound (£)" },
  { code: "ZAR", symbol: "R", label: "South African Rand (R)" },
];

const SERVICE_PRESETS: Record<string, string[]> = {
  "Hair Salon": ["Haircut", "Blowout", "Hair Color"],
  "Nail Studio": ["Gel Manicure", "Acrylic Nails", "Pedicure"],
  "Barbershop": ["Haircut", "Beard Trim", "Hot Shave"],
  "Dental Clinic": ["Cleaning", "Consultation", "Whitening"],
  "Massage Studio": ["Swedish Massage", "Deep Tissue", "Hot Stone"],
};

function detectCurrency(): string {
  try {
    const locale = navigator.language;
    if (locale === "en-US") return "USD";
    if (locale.startsWith("fr")) return "EUR";
    if (locale === "en-GB") return "GBP";
    return "MUR";
  } catch {
    return "MUR";
  }
}

function makeService(name = ""): Service {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name,
    price: "",
    duration: "",
  };
}

export interface Step1Data {
  businessName: string;
  businessType: string;
  currency: string;
  currencySymbol: string;
  workingHours: WorkingHoursData;
  services: Service[];
}

interface Props {
  initialData?: Partial<Step1Data>;
  onContinue: (data: Step1Data) => void;
}

export function Step1BusinessDetails({ initialData, onContinue }: Props) {
  const [businessName, setBusinessName] = useState(initialData?.businessName ?? "");
  const [businessType, setBusinessType] = useState(initialData?.businessType ?? BUSINESS_TYPES[0]);
  const [currency, setCurrency] = useState(initialData?.currency ?? detectCurrency());
  const [workingHours, setWorkingHours] = useState<WorkingHoursData>(
    initialData?.workingHours ?? DEFAULT_HOURS
  );
  const [services, setServices] = useState<Service[]>(
    initialData?.services ?? [makeService()]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasInteracted, setHasInteracted] = useState(false);

  const currencyObj =
    CURRENCY_OPTIONS.find((c) => c.code === currency) ?? CURRENCY_OPTIONS[0];

  // Pre-fill services when business type changes (only on first mount or explicit change)
  useEffect(() => {
    if (!hasInteracted && !initialData?.services) {
      const presets = SERVICE_PRESETS[businessType];
      if (presets) {
        const ts = Date.now();
        setServices(
          presets.map((name, i) => ({ id: `${ts}_${i}`, name, price: "", duration: "" }))
        );
      } else {
        setServices([makeService()]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessType]);

  const handleBusinessTypeChange = (type: string) => {
    setHasInteracted(false); // allow preset to fire
    setBusinessType(type);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (businessName.trim().length < 2) {
      errs.businessName = "Business name must be at least 2 characters";
    }
    const hasNamedService = services.some((s) => s.name.trim().length > 0);
    if (!hasNamedService) {
      errs.services = "Please add at least one service name";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    onContinue({
      businessName: businessName.trim(),
      businessType,
      currency,
      currencySymbol: currencyObj.symbol,
      workingHours,
      services,
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Tell us about your business</h2>
        <p className="mt-2 text-slate-600">This helps our AI understand what services you offer.</p>
      </div>

      <div className="space-y-5">
        {/* Business Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Business Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Beauty Studio by Sarah"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              if (errors.businessName) setErrors((p) => ({ ...p, businessName: "" }));
            }}
            error={errors.businessName}
            style={{ fontSize: 16 }}
          />
        </div>

        {/* Business Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Business Type</label>
          <select
            value={businessType}
            onChange={(e) => handleBusinessTypeChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            style={{ fontSize: 16 }}
          >
            {BUSINESS_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Currency */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            style={{ fontSize: 16 }}
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Working Hours */}
        <WorkingHours value={workingHours} onChange={setWorkingHours} />

        {/* Services Repeater */}
        <div className="space-y-2">
          <ServicesRepeater
            services={services}
            onChange={(updated) => {
              setHasInteracted(true);
              setServices(updated);
              if (errors.services) setErrors((p) => ({ ...p, services: "" }));
            }}
            currencySymbol={currencyObj.symbol}
            errors={errors}
          />
          {errors.services && (
            <p className="text-xs text-red-500">{errors.services}</p>
          )}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button onClick={handleContinue} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
