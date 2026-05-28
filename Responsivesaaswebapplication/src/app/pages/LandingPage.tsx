import { Link } from "react-router";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../components/ui";
import {
  MessageSquare, CalendarCheck, Clock, Zap, CheckCircle2,
  Menu, X, Send, Star, ArrowRight, Smartphone, Bot,
  TrendingUp, Shield,
} from "lucide-react";
import { BookFlowLogo, BookFlowIcon } from "../components/BookFlowLogo";
import { useState, useRef, useEffect } from "react";

type ChatMsg = { role: 'user' | 'ai'; text: string; time: string };

const INITIAL_CHAT: ChatMsg[] = [
  { role: 'user', text: "Hi! I'd like to book an appointment for tomorrow.", time: "10:42 AM" },
  { role: 'ai', text: "Hello! 👋 Happy to help. What service are you looking for?\n\n1. Hair & Styling\n2. Nails & Beauty\n3. Consultation\n4. Other service\n\nReply with a number or describe what you need.", time: "10:42 AM" },
  { role: 'user', text: "1", time: "10:43 AM" },
  { role: 'ai', text: "Great! Available times for Hair & Styling tomorrow:\n\n1. 10:00 AM\n2. 2:30 PM\n3. 4:00 PM\n\nReply 1, 2, or 3 to confirm your slot. ✂️", time: "10:43 AM" },
  { role: 'user', text: "2", time: "10:44 AM" },
  { role: 'ai', text: "Done! ✅ Appointment booked for tomorrow at 2:30 PM.\n\nI'll send you a WhatsApp reminder 2 hours before. See you then!", time: "10:44 AM" },
];

const STATS = [
  { value: "500+", label: "Businesses served" },
  { value: "94%", label: "Booking success rate" },
  { value: "< 3 min", label: "Avg. booking time" },
  { value: "40%", label: "Fewer no-shows" },
];

const BUSINESS_TYPES = [
  "Salon", "Clinic", "Restaurant", "Tutor", "Gym",
  "Repair Shop", "Consultant", "Freelancer", "Barber", "SME",
];

const STEPS = [
  {
    icon: Smartphone,
    step: "01",
    title: "Connect your WhatsApp",
    desc: "Link your existing WhatsApp Business number in minutes. No technical skills required.",
  },
  {
    icon: Bot,
    step: "02",
    title: "Train your AI in 5 minutes",
    desc: "Add your services, prices, and working hours. Your AI learns everything about your business.",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Watch bookings come in",
    desc: "Your AI handles every message — qualifying leads, scheduling, confirming — while you focus on your craft.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Nail Studio Owner, Mumbai",
    quote: "I used to miss 5–6 bookings a week when I was with clients. BookFlow handles everything now. My revenue is up 30% and I barely touch my phone.",
    stars: 5,
  },
  {
    name: "Ravi Menon",
    role: "Barbershop Owner, Bangalore",
    quote: "Setup took 10 minutes. Customers love how fast they get replies. No-shows dropped significantly once reminders went automatic.",
    stars: 5,
  },
  {
    name: "Aisha Boolell",
    role: "Physiotherapy Clinic, Port Louis",
    quote: "Finally a tool made for small businesses. Patients book through WhatsApp just like they always did — I just stopped doing it manually.",
    stars: 5,
  },
];

function getDemoReply(message: string): string {
  const msg = message.toLowerCase().trim();

  if (/\b(hi|hello|hey|hola|good morning|good afternoon)\b/.test(msg)) {
    return "Hello! 👋 Welcome! I'm your AI booking assistant.\n\nWhat service would you like to book today?\n\nYou can ask about haircuts, nail services, massages, clinic visits, gym sessions, tutoring, repairs, and more!";
  }

  if (/\b(book|appointment|schedule|reserve|slot)\b/.test(msg)) {
    return "Great! I'd love to help you book. 📅\n\nWhat type of service are you interested in?\n\n1. Hair & Styling\n2. Nails & Beauty\n3. Massage & Wellness\n4. Clinic / Consultation\n5. Gym / Fitness\n\nJust type the service name or a number!";
  }

  if (/\b(hair|haircut|style|styling|color|highlight|blowout|trim|barber)\b/.test(msg)) {
    return "Perfect! Here are available times for Hair Services tomorrow:\n\n1. 10:00 AM\n2. 2:30 PM\n3. 4:00 PM\n\nReply with 1, 2, or 3 to confirm your slot. ✂️";
  }

  if (/\b(nail|manicure|pedicure|gel|acrylic|polish)\b/.test(msg)) {
    return "Lovely! Available slots for Nail Services:\n\n1. 11:00 AM\n2. 1:30 PM\n3. 3:00 PM\n\nWhich time works for you? Reply 1, 2, or 3. 💅";
  }

  if (/\b(massage|spa|relaxation|wellness|therapy|facial)\b/.test(msg)) {
    return "Great choice! Available slots for Massage & Wellness:\n\n1. 10:30 AM\n2. 12:00 PM\n3. 3:30 PM\n\nReply 1, 2, or 3 to book your slot. 🌿";
  }

  if (/\b(doctor|clinic|physio|dental|consult|consultation|checkup|check-up)\b/.test(msg)) {
    return "Sure! Available consultation slots:\n\n1. 9:00 AM — 30 min session\n2. 11:00 AM — 30 min session\n3. 2:00 PM — 30 min session\n\nReply with 1, 2, or 3 to confirm. 🏥";
  }

  if (/\b(gym|fitness|workout|training|yoga|pilates|exercise)\b/.test(msg)) {
    return "Let's get you booked in! Available gym/fitness slots:\n\n1. 7:00 AM — Morning session\n2. 12:00 PM — Midday session\n3. 6:00 PM — Evening session\n\nReply 1, 2, or 3 to confirm. 💪";
  }

  if (/\b(tutor|tutoring|lesson|study|coaching|teach|class)\b/.test(msg)) {
    return "Happy to help! Available tutoring sessions:\n\n1. 9:00 AM — 1 hour\n2. 2:00 PM — 1 hour\n3. 5:00 PM — 1 hour\n\nReply 1, 2, or 3 to book your session. 📚";
  }

  if (/\b(repair|fix|service|phone|device|appliance|car)\b/.test(msg)) {
    return "Got it! Available slots for a service/repair visit:\n\n1. 10:00 AM\n2. 1:00 PM\n3. 4:00 PM\n\nReply 1, 2, or 3 and we'll confirm your booking. 🔧";
  }

  if (/\b(restaurant|table|dining|food|lunch|dinner|breakfast)\b/.test(msg)) {
    return "I can help reserve a table! Available slots:\n\n1. 12:00 PM — Lunch\n2. 7:00 PM — Dinner\n3. 8:30 PM — Dinner\n\nReply 1, 2, or 3 to confirm your reservation. 🍽️";
  }

  if (/^[123]$/.test(msg)) {
    const slots = ["10:00 AM", "2:30 PM", "4:00 PM"];
    const chosen = slots[parseInt(msg) - 1] || "the selected time";
    return `✅ Booking confirmed for ${chosen} tomorrow!\n\nYou'll receive a WhatsApp reminder 2 hours before your appointment.\n\nNeed to make changes? Just message me anytime. 😊`;
  }

  if (/\b(reminder|remind|notification|alert)\b/.test(msg)) {
    return "Absolutely! 🔔 BookFlow sends automatic WhatsApp reminders:\n\n• 24 hours before your appointment\n• 2 hours before your appointment\n\nBusinesses using BookFlow see no-shows drop by up to 40%. Would you like to book an appointment?";
  }

  if (/\b(price|cost|how much|fee|charge|rate)\b/.test(msg)) {
    return "Prices vary by service and business type. 💰\n\nWould you like to:\n• Book a specific service\n• Learn about BookFlow plans\n\nJust type a service name and I'll show availability!";
  }

  if (/\b(cancel|reschedule|change|postpone)\b/.test(msg)) {
    return "No problem! To cancel or reschedule:\n\nJust tell me:\n1. The date/time of your booking, or\n2. Your booking reference\n\nI'll update it right away. 📅";
  }

  return "I'm here to help you book an appointment! 😊\n\nTry asking:\n• 'Book a haircut'\n• 'I need a massage'\n• 'Schedule a consultation'\n• 'Gym class available?'\n• 'Reserve a table'\n\nWhat service can I help you with?";
}

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Ensure page always starts at top on load/refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll chat to bottom only on user interaction, not on initial render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatTyping]);

  const sendChat = () => {
    if (!chatInput.trim() || chatTyping) return;
    const userText = chatInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { role: 'user', text: userText, time: now }]);
    setChatInput('');
    setChatTyping(true);
    setTimeout(() => {
      const reply = getDemoReply(userText);
      setChatMessages(prev => [
        ...prev,
        { role: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      setChatTyping(false);
    }, 700 + Math.random() * 600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <BookFlowIcon size="lg" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">BookFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <div className="flex items-center gap-3 ml-4 border-l border-slate-200 pl-4">
              <Link to="/login" className="hover:text-slate-900 transition-colors">Log in</Link>
              <Link to="/signup">
                <Button size="sm" className="shadow-sm whitespace-nowrap">Start 7-Day Free Trial</Button>
              </Link>
            </div>
          </nav>

          <button
            className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3">
            <div className="space-y-1">
              <a href="#features" className="block text-slate-600 font-medium px-3 py-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block text-slate-600 font-medium px-3 py-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
              <a href="#pricing" className="block text-slate-600 font-medium px-3 py-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
              <Link to="/login" className="block text-slate-600 font-medium px-3 py-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth>Start 7-Day Free Trial</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-20 md:py-28 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left: Copy */}
              <div className="flex flex-col gap-6 text-center lg:text-left">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 text-sm font-medium text-[#1fae54]">
                    <Zap className="h-3.5 w-3.5 shrink-0" />
                    WhatsApp Booking AI — Now Live
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-bold tracking-tight text-slate-900 leading-[1.15]">
                    Your business's{' '}
                    <span className="text-[#25D366]">24/7 AI booking assistant</span>
                    {' '}on WhatsApp
                  </h1>
                  <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                    BookFlow's AI replies to every customer, books appointments, and sends reminders — automatically. Works for any service or appointment-based business.
                  </p>
                </div>

                {/* Business type chips */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center lg:text-left">Works for</p>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {BUSINESS_TYPES.map(type => (
                      <span
                        key={type}
                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-[#25D366]/10 hover:text-[#1fae54] transition-colors cursor-default"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button size="lg" fullWidth className="shadow-md text-base px-8 gap-2">
                      Start 7-Day Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="#how-it-works" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" fullWidth className="text-base px-8">
                      See How It Works
                    </Button>
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#25D366] shrink-0" />
                    7-day free trial
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#25D366] shrink-0" />
                    Cancel anytime
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#25D366] shrink-0" />
                    Setup in minutes
                  </div>
                </div>
              </div>

              {/* Right: Interactive Chat Demo */}
              <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-full">
                <div className="absolute -inset-4 bg-[#25D366]/8 rounded-3xl blur-3xl pointer-events-none" />
                <div className="relative rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-200">
                  <div className="rounded-xl overflow-hidden">
                    <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-xs">AI</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-sm">BookFlow Assistant</div>
                        <div className="text-white/70 text-xs">AI · always online</div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse shrink-0" />
                        <span className="text-white/80 text-xs font-medium">Live Demo</span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#E5DDD5] space-y-3 h-[300px] overflow-y-auto">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`${msg.role === 'user' ? 'bg-[#DCF8C6]' : 'bg-white'} rounded-xl px-3 py-2.5 max-w-[82%] shadow-sm text-sm leading-relaxed`}>
                            {msg.text.split('\n').map((line, j, arr) => (
                              <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                            ))}
                            <div className="text-[10px] text-slate-400 text-right mt-1">{msg.time}</div>
                          </div>
                        </div>
                      ))}
                      {chatTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white rounded-xl px-4 py-3 shadow-sm text-slate-400 text-sm">typing…</div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="bg-[#F0F0F0] px-3 py-2.5 flex items-center gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendChat()}
                        placeholder="Try: 'book a haircut' or 'hello'…"
                        className="flex-1 rounded-full bg-white px-4 py-2 text-sm focus:outline-none"
                      />
                      <button
                        onClick={sendChat}
                        disabled={chatTyping || !chatInput.trim()}
                        className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white disabled:opacity-40 shrink-0 transition-opacity"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Stats Strip ── */}
        <section className="border-y border-slate-100 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">{value}</div>
                  <div className="mt-1.5 text-sm text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="bg-white py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Built for service businesses
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Your business runs on autopilot
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Your AI assistant handles bookings while you focus on delivering great service.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <CardTitle className="text-lg">Replies in seconds, not hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed text-sm">Your AI reads every WhatsApp message and responds instantly — understanding services, prices, and availability. Day or night, every day.</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4">
                    <CalendarCheck className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <CardTitle className="text-lg">Zero double bookings, ever</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed text-sm">BookFlow checks your live calendar before confirming any appointment. Customers only see time slots that are genuinely free.</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <CardTitle className="text-lg">Reminders that cut no-shows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed text-sm">Automated WhatsApp reminders go out before every appointment. Businesses using BookFlow see no-shows drop by up to 40% in the first month.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="bg-slate-50 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Simple setup
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Up and running in 10 minutes
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                No developers, no complicated setup. If you can send a WhatsApp message, you can use BookFlow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
              {STEPS.map(({ icon: Icon, step, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{step.replace('0', '')}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="bg-white py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Customer stories
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Loved by businesses across the region
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {TESTIMONIALS.map(({ name, role, quote, stars }) => (
                <Card key={name} className="border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex gap-0.5 mb-5">
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 leading-relaxed text-sm flex-1 mb-6">"{quote}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center text-xs font-bold text-[#25D366] shrink-0">
                        {name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                        <p className="text-xs text-slate-500 truncate">{role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="bg-slate-50 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Pricing
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Simple, honest pricing</h2>
              <p className="mt-4 text-lg text-slate-600">Start with a 7-day free trial. Upgrade when you're ready. No hidden fees.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">

              {/* Starter */}
              <Card className="flex flex-col bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold">Starter</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">Rs 990</span>
                    <span className="text-sm font-medium text-slate-400">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Perfect for solo practitioners and small businesses.</p>
                  <p className="mt-1.5 text-xs font-semibold text-[#25D366]">✓ 7-day free trial included</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1 mb-8">
                    {[
                      'Up to 100 bookings/month',
                      'AI replies on WhatsApp',
                      '1 calendar sync',
                      'Basic appointment reminders',
                      'Booking dashboard',
                    ].map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#25D366] shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button variant="outline" fullWidth>Start 7-Day Free Trial</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Professional */}
              <Card className="flex flex-col bg-white border-2 border-[#25D366] shadow-xl relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#25D366] text-white px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full whitespace-nowrap">
                  Most Popular
                </div>
                <CardHeader className="pb-4 pt-8">
                  <CardTitle className="text-xl font-bold">Professional</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">Rs 2,490</span>
                    <span className="text-sm font-medium text-slate-400">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">For busy service businesses and growing teams.</p>
                  <p className="mt-1.5 text-xs font-semibold text-[#25D366]">✓ 7-day free trial included</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1 mb-8">
                    {[
                      'Unlimited bookings',
                      'Advanced AI conversations',
                      'Unlimited calendar syncs',
                      'Automated reminders',
                      'Analytics dashboard',
                      'Priority support',
                    ].map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#25D366] shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button fullWidth>Start 7-Day Free Trial</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Enterprise */}
              <Card className="flex flex-col bg-white md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold">Enterprise</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">Rs 4,990</span>
                    <span className="text-sm font-medium text-slate-400">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">For multi-location businesses and franchise groups.</p>
                  <p className="mt-1.5 text-xs font-semibold text-[#25D366]">✓ 7-day free trial included</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1 mb-8">
                    {[
                      'Everything in Professional',
                      'Multiple WhatsApp numbers',
                      'API & webhook access',
                      'Custom AI training',
                      'White-label options',
                      'Dedicated account manager',
                    ].map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#25D366] shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{f}</span>
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

        {/* ── Final CTA ── */}
        <section className="bg-[#0A1128] py-20 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-white/50 text-sm ml-2">Trusted by 500+ businesses</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Start automating your bookings today
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Join hundreds of service businesses already saving hours every week — and growing faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" fullWidth className="text-base px-8 gap-2 shadow-lg">
                    Start 7-Day Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-12 px-8 text-base font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                    Log In
                  </button>
                </Link>
              </div>
              <p className="text-slate-500 text-sm pt-1">
                7-day free trial · Cancel anytime · Setup in minutes
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 border-t border-white/5 py-14 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4 hover:opacity-90 transition-opacity w-fit">
                <BookFlowIcon size="md" />
                <span className="text-xl font-bold text-white tracking-tight">BookFlow</span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs">
                WhatsApp booking automation for any service or appointment-based business.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Account</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">Log in</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Start free trial</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Trust */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Why BookFlow</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-[#25D366] shrink-0" /> Secure & private</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#25D366] shrink-0" /> 99.9% uptime</li>
                <li className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5 text-[#25D366] shrink-0" /> GDPR compliant</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>© 2026 BookFlow Inc. All rights reserved.</p>
            <p className="text-slate-600">Helping service businesses grow — one booking at a time.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
