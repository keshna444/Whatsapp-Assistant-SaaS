import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, Card, CardContent, Input } from "../../components/ui";
import { CheckCircle2, QrCode } from "lucide-react";
import bookFlowLogo from "../../../styles/BookFlowLogo.png";
import { cn } from "../../components/ui";

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <img src={bookFlowLogo} alt="BookFlow" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold tracking-tight text-slate-900">BookFlow</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 hidden sm:block rounded-full"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#25D366] z-0 hidden sm:block transition-all duration-300 rounded-full" 
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            ></div>
            
            {[1, 2, 3].map((s) => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 bg-white",
                  step >= s ? "border-[#25D366] text-[#25D366]" : "border-slate-300 text-slate-400",
                  step > s && "bg-[#25D366] text-white"
                )}>
                  {step > s ? <CheckCircle2 className="w-5 h-5 text-white" /> : s}
                </div>
                <span className="text-xs font-medium text-slate-500 hidden sm:block">
                  {s === 1 ? 'Business Details' : s === 2 ? 'Connect WhatsApp' : 'Test AI'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          {step === 1 && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">Tell us about your business</h2>
                <p className="mt-2 text-slate-600">This helps our AI understand what services you offer.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Business Type</label>
                  <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]">
                    <option>Hair Salon</option>
                    <option>Nail Technician</option>
                    <option>Lash Technician</option>
                    <option>Barbershop</option>
                    <option>Spa / Massage</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Currency</label>
                  <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]" defaultValue="MUR">
                    <option value="MUR">Mauritian Rupee (Rs)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Add a popular service</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input placeholder="Service name (e.g. Gel Manicure)" className="flex-1" />
                    <Input placeholder="Price (e.g. 800)" type="number" className="sm:w-32" />
                    <Input placeholder="Duration (min)" type="number" className="sm:w-32" defaultValue="45" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleNext} size="lg">Continue</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">Connect your WhatsApp</h2>
                <p className="mt-2 text-slate-600">Scan this code with your WhatsApp app to link your number to BookFlow.</p>
              </div>

              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <QrCode className="w-48 h-48 text-slate-400" />
                <p className="mt-4 text-sm text-slate-500 font-medium">Open WhatsApp &gt; Linked Devices &gt; Link a Device</p>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleNext} size="lg">I've scanned the code</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Test your AI Assistant</h2>
                <p className="mt-2 text-slate-600">Try sending a message as if you were a customer.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="order-2 md:order-1 space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">What's happening?</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-600">The AI reads the customer's message and understands the intent.</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-600">It checks your available services and calendar availability instantly.</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-600">It replies politely and guides the customer to book an appointment.</p>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="order-1 md:order-2 rounded-xl bg-slate-50 overflow-hidden shadow-sm border border-slate-200 h-[450px] flex flex-col">
                  <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-semibold">BF</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Your Business AI</div>
                      <div className="text-white/80 text-xs">Online</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 bg-[#E5DDD5] space-y-4 overflow-y-auto">
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm text-sm">
                        Hello! I'm your new AI assistant. I'm ready to help your customers book appointments.
                        <br/><br/>
                        Try asking me: "Can I book a Gel Manicure for tomorrow?"
                        <div className="text-[10px] text-gray-500 text-right mt-1">Now</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-100 p-3 flex gap-2">
                    <Input placeholder="Type a message..." className="bg-white" />
                    <Button className="shrink-0 rounded-full w-10 h-10 p-0 flex items-center justify-center bg-[#128C7E] hover:bg-[#075E54]">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-white"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleNext} size="lg">Go to Dashboard</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}