import { useState } from "react";
import { useNavigate } from "react-router";
import { Check } from "lucide-react";
import { cn } from "../../components/ui";
import bookFlowLogo from "../../../styles/BookFlowLogo.png";
import { Step1BusinessDetails, Step1Data } from "./Step1BusinessDetails";
import { Step2ConnectWhatsApp } from "./Step2ConnectWhatsApp";
import { Step3TestAI } from "./Step3TestAI";

const STEP_LABELS = ["Business Details", "Connect WhatsApp", "Test AI"] as const;

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const navigate = useNavigate();

  const handleStep1Continue = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sm:px-6 lg:px-8 shrink-0">
        <div className="flex items-center gap-2">
          <img src={bookFlowLogo} alt="BookFlow" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold tracking-tight text-slate-900">BookFlow</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Progress bar */}
        <div className="mb-8 px-2 sm:px-0">
          <div className="relative flex items-start justify-between">
            {/* Background connector line */}
            <div className="absolute left-5 right-5 top-5 -translate-y-1/2 h-0.5 bg-slate-200 hidden sm:block" />

            {/* Active connector line */}
            <div
              className="absolute left-5 top-5 -translate-y-1/2 h-0.5 bg-[#25D366] hidden sm:block transition-all duration-500"
              style={{
                width:
                  step === 1
                    ? "0%"
                    : step === 2
                    ? "calc(50% - 10px)"
                    : "calc(100% - 10px)",
              }}
            />

            {STEP_LABELS.map((label, i) => {
              const s = i + 1;
              const completed = step > s;
              const active = step === s;
              return (
                <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300",
                      completed && "bg-[#25D366] border-[#25D366] text-white",
                      active && "bg-[#25D366] border-[#25D366] text-white",
                      !completed && !active && "bg-white border-slate-300 text-slate-400"
                    )}
                  >
                    {completed ? <Check className="w-5 h-5" strokeWidth={3} /> : s}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium hidden sm:block text-center max-w-[80px] leading-tight",
                      active ? "text-slate-700" : "text-slate-400"
                    )}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          {step === 1 && (
            <Step1BusinessDetails
              initialData={step1Data ?? undefined}
              onContinue={handleStep1Continue}
            />
          )}

          {step === 2 && (
            <Step2ConnectWhatsApp
              onContinue={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3TestAI
              step1Data={
                step1Data ?? {
                  businessName: "Your Business",
                  businessType: "Other",
                  currency: "MUR",
                  currencySymbol: "Rs",
                  workingHours: {} as never,
                  services: [{ id: "1", name: "Service", price: "", duration: "" }],
                }
              }
              onGoToDashboard={() => navigate("/dashboard")}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
