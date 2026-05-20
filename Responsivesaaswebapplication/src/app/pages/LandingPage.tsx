import { Link } from "react-router";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../components/ui";
import { MessageSquare, CalendarCheck, Clock, Zap, CheckCircle2, Menu, X, Send } from "lucide-react";
import bookFlowLogo from "../../styles/BookFlowLogo.png";
import { useState, useRef, useEffect } from "react";

type ChatMsg = { role: 'user' | 'ai'; text: string; time: string };

const INITIAL_CHAT: ChatMsg[] = [
  { role: 'user', text: "Hi! I'd like to book a gel manicure for tomorrow afternoon.", time: "10:42 AM" },
  { role: 'ai', text: "Hello! 👋 I can help you with that. We have these times available tomorrow afternoon for a Gel Manicure (Rs 800, 45 mins):\n\n1. 2:00 PM\n2. 3:30 PM\n3. 4:15 PM\n\nPlease reply with the number of your preferred time.", time: "10:42 AM" },
  { role: 'user', text: "2", time: "10:44 AM" },
  { role: 'ai', text: "Perfect! I've booked you in for a Gel Manicure tomorrow at 3:30 PM. 🎉\n\nYou'll receive a reminder 2 hours before your appointment. See you then!", time: "10:44 AM" },
];

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatTyping]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatTyping) return;
    const userText = chatInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { role: 'user', text: userText, time: now }]);
    setChatInput('');
    setChatTyping(true);
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      const reply = data.reply ?? data.message ?? 'Sorry, I could not process that.';
      setChatMessages(prev => [...prev, { role: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am unavailable right now.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setChatTyping(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <img src={bookFlowLogo} alt="BookFlow" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-slate-900">BookFlow</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <div className="flex items-center gap-4 ml-4 border-l border-slate-200 pl-4">
              <Link to="/login" className="hover:text-slate-900 transition-colors">Log in</Link>
              <Link to="/signup">
                <Button size="sm">Start Free Trial</Button>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-slate-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="text-slate-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <div className="h-px bg-slate-200" />
              <Link to="/login" className="text-slate-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth>Start Free Trial</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden py-20 md:py-28 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Copy */}
              <div className="flex flex-col space-y-8 text-center lg:text-left">
                <div className="space-y-5">
                  <div className="inline-flex items-center rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1 text-sm font-medium text-[#1fae54]">
                    <Zap className="mr-1 h-4 w-4" />
                    New: AI Auto-booking is live
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                    Turn WhatsApp messages into{' '}
                    <span className="text-[#25D366]">confirmed bookings</span>{' '}
                    automatically
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0">
                    Stop losing customers while you're busy. BookFlow's AI assistant replies instantly, shows your services, and schedules appointments directly in WhatsApp.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button size="lg" fullWidth className="text-base px-8">Start Free Trial</Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" fullWidth className="text-base px-8">View Demo</Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#25D366] shrink-0" />
                    7-day free trial · Cancel anytime
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#25D366] shrink-0" />
                    Have a code? Redeem it at checkout
                  </div>
                </div>
              </div>

              {/* Right: WhatsApp Demo */}
              <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-full">
                <div className="relative rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-200">
                  <div className="rounded-xl bg-slate-50 overflow-hidden">
                    {/* Chat header */}
                    <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <span className="text-white font-semibold text-sm">BF</span>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Beauty Studio</div>
                        <div className="text-white/80 text-xs">AI Assistant online</div>
                      </div>
                    </div>
                    {/* Chat messages */}
                    <div className="p-4 bg-[#E5DDD5] space-y-3 h-[320px] overflow-y-auto">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`${msg.role === 'user' ? 'bg-[#DCF8C6]' : 'bg-white'} rounded-lg p-3 max-w-[80%] shadow-sm text-sm`}>
                            {msg.text.split('\n').map((line, j, arr) => (
                              <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                            ))}
                            <div className="text-[10px] text-gray-500 text-right mt-1">{msg.time}</div>
                          </div>
                        </div>
                      ))}
                      {chatTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm text-sm text-slate-500 italic">typing…</div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    {/* Chat input */}
                    <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendChat()}
                        placeholder="Type a message"
                        className="flex-1 rounded-full bg-white px-4 py-2 text-sm focus:outline-none"
                      />
                      <button
                        onClick={sendChat}
                        disabled={chatTyping || !chatInput.trim()}
                        className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white disabled:opacity-50 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" className="bg-white py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need to manage bookings effortlessly
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Designed specifically for beauty salons, barbers, and independent technicians.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <CardTitle className="text-lg">Instant AI Replies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">Never leave a customer waiting. Our AI understands services, checks your calendar, and replies in seconds, 24/7.</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4">
                    <CalendarCheck className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <CardTitle className="text-lg">Smart Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">Prevents double bookings automatically. Syncs with your existing calendar to show true real-time availability.</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-md hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <CardTitle className="text-lg">Automated Reminders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">Drastically reduce no-shows. The assistant automatically sends WhatsApp reminders before the appointment.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Pricing Section ── */}
        <section id="pricing" className="bg-slate-50 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Simple, transparent pricing</h2>
              <p className="mt-4 text-lg text-slate-600">Start for free, upgrade when you need to grow.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter */}
              <Card className="flex flex-col bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Starter</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">Rs 990</span>
                    <span className="text-base font-medium text-slate-500">/mo</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Perfect for independent technicians.</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1 mb-8">
                    {['Up to 100 bookings/mo', 'Basic AI responses', '1 Calendar sync', 'Manual reminders'].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#25D366] shrink-0" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button variant="outline" fullWidth>Start Free Trial</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Professional — Most Popular */}
              <Card className="flex flex-col bg-white border-2 border-[#25D366] shadow-lg relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#25D366] text-white px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full whitespace-nowrap">
                  Most Popular
                </div>
                <CardHeader className="pb-4 pt-8">
                  <CardTitle className="text-xl">Professional</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">Rs 2,490</span>
                    <span className="text-base font-medium text-slate-500">/mo</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">For busy salons and teams.</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1 mb-8">
                    {['Unlimited bookings', 'Advanced AI conversationalist', 'Unlimited Calendar syncs', 'Automated reminders', 'Analytics dashboard'].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#25D366] shrink-0" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button fullWidth>Start Free Trial</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Enterprise */}
              <Card className="flex flex-col bg-white md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">Rs 4,990</span>
                    <span className="text-base font-medium text-slate-500">/mo</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">For multi-location franchises.</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1 mb-8">
                    {['Everything in Pro', 'Multiple WhatsApp numbers', 'API access', 'Custom integrations', 'Priority support'].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#25D366] shrink-0" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button variant="outline" fullWidth>Contact Sales</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 py-12 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={bookFlowLogo} alt="BookFlow" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white">BookFlow</span>
          </div>
          <p className="text-sm">© 2026 BookFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
