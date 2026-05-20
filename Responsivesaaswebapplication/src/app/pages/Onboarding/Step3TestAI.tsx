import { useState } from "react";
import { Button, cn } from "../../components/ui";
import { BookOpen, Search, CalendarCheck } from "lucide-react";
import { SimulatedChat } from "./SimulatedChat";
import { Step1Data } from "./Step1BusinessDetails";

interface Props {
  step1Data: Step1Data;
  onGoToDashboard: () => void;
  onBack: () => void;
}

const AI_STEPS = [
  {
    Icon: BookOpen,
    label: "Reads the message",
    desc: "AI understands what the customer wants and when",
    activatesAt: 2,
  },
  {
    Icon: Search,
    label: "Checks availability",
    desc: "Looks at your calendar and available services",
    activatesAt: 3,
  },
  {
    Icon: CalendarCheck,
    label: "Confirms the booking",
    desc: "Replies with details and sends a reminder",
    activatesAt: 4,
  },
];

export function Step3TestAI({ step1Data, onGoToDashboard, onBack }: Props) {
  // activeStep: 1 = idle, 2 = reading, 3 = checking, 4 = confirmed
  const [activeStep, setActiveStep] = useState(1);

  const isDone = activeStep >= 4;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Test your AI Assistant</h2>
        <p className="mt-2 text-slate-600">
          See how your AI responds to a customer — no setup needed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left column — How your AI works */}
        <div className="order-2 md:order-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-5">How your AI works</h3>
            <div className="space-y-3">
              {AI_STEPS.map(({ Icon, label, desc, activatesAt }) => {
                const isActive = activeStep >= activatesAt;
                return (
                  <div
                    key={label}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-3 transition-all duration-500",
                      isActive
                        ? "bg-green-50 border border-green-100"
                        : "opacity-40 border border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500",
                        isActive ? "bg-[#25D366]" : "bg-slate-200"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors duration-500",
                          isActive ? "text-white" : "text-slate-400"
                        )}
                      />
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold transition-colors duration-500",
                          isActive ? "text-slate-900" : "text-slate-400"
                        )}
                      >
                        {label}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-0.5 transition-colors duration-500",
                          isActive ? "text-slate-600" : "text-slate-300"
                        )}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column — Simulated chat */}
        <div className="order-1 md:order-2">
          <SimulatedChat
            step1Data={step1Data}
            onGoToDashboard={onGoToDashboard}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-100">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        {isDone ? (
          <Button onClick={onGoToDashboard} size="lg">
            Go to Dashboard
          </Button>
        ) : (
          <Button onClick={onGoToDashboard} variant="outline" size="lg">
            Skip to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
