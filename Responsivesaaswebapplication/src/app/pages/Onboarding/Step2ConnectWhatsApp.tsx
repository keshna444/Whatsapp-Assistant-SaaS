import { useState } from "react";
import { Button } from "../../components/ui";
import { Check, Clock, Loader2, MessageCircle } from "lucide-react";

type ConnectionState = "default" | "loading" | "pending" | "connected";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

const TRUST_BULLETS = [
  "Official Meta Business API — your number stays safe",
  "No app to install — works on your existing WhatsApp Business number",
  "You can disconnect at any time from settings",
];

export function Step2ConnectWhatsApp({ onContinue, onBack }: Props) {
  // Default to "pending" until Meta App is approved
  const [state, setState] = useState<ConnectionState>("pending");
  const [connectedNumber] = useState("");

  const handleConnectClick = () => {
    setState("loading");
    // Simulate pre-approval: after brief loading, show pending card
    setTimeout(() => setState("pending"), 1500);
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white fill-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Connect your WhatsApp Business number
        </h2>
        <p className="text-slate-600">
          BookFlow will reply to your customers automatically — 24/7, even when you're busy.
        </p>
      </div>

      {/* State card */}
      {state === "pending" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 flex flex-col items-center text-center space-y-3">
          <Clock className="w-8 h-8 text-amber-500" />
          <p className="text-sm font-medium text-amber-800">
            Your WhatsApp connection is being set up. We'll notify you by email when it's ready.
          </p>
          <Button variant="outline" onClick={onContinue} className="mt-1">
            Continue anyway →
          </Button>
        </div>
      )}

      {state === "connected" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <p className="font-semibold text-slate-900">Connected: {connectedNumber}</p>
          <p className="text-sm text-slate-600">Your AI assistant is ready.</p>
        </div>
      )}

      {(state === "default" || state === "loading") && (
        <div className="flex justify-center">
          <Button
            onClick={handleConnectClick}
            size="lg"
            disabled={state === "loading"}
            className="w-full sm:max-w-[360px] gap-2"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Opening WhatsApp...
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                Connect with WhatsApp
              </>
            )}
          </Button>
        </div>
      )}

      {/* Trust bullets */}
      <ul className="space-y-2">
        {TRUST_BULLETS.map((text) => (
          <li key={text} className="flex items-start gap-2 text-sm text-slate-500">
            <Check className="w-4 h-4 text-[#25D366] mt-0.5 shrink-0" />
            {text}
          </li>
        ))}
      </ul>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        {state === "connected" && (
          <Button onClick={onContinue} size="lg">
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
