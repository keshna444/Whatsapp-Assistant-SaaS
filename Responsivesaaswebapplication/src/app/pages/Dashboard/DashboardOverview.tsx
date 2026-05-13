import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "../../components/ui";
import { Users, Calendar, TrendingUp, MessageCircle, ArrowUpRight, Clock, X, Link2, Copy, Check, ExternalLink } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";

const API = "http://localhost:5000/api";

type Appointment = {
  _id: string;
  customerName: string;
  service: string;
  appointmentDate: string;
  status: string;
};

type AIAction = {
  text: string;
  time: string;
  type: "success" | "info" | "warning";
};

type Stats = {
  totalBookings: number;
  completedBookings: number;
  totalCustomers: number;
  totalServices: number;
  aiHandledChats: number;
  revenue: number;
  newCustomers: number;
  upcomingAppointments: Appointment[];
  recentAIActions: AIAction[];
};

type Service = { _id: string; name: string; price?: number };

type BookingForm = {
  customerName: string;
  customerPhone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  status: string;
};

const EMPTY_FORM: BookingForm = {
  customerName: '',
  customerPhone: '',
  service: '',
  date: '',
  time: '',
  notes: '',
  status: 'pending',
};

const DEFAULT_STATS: Stats = {
  totalBookings: 0,
  completedBookings: 0,
  totalCustomers: 0,
  totalServices: 0,
  aiHandledChats: 0,
  revenue: 0,
  newCustomers: 0,
  upcomingAppointments: [],
  recentAIActions: [],
};

function formatApptTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

const actionDotColor: Record<string, string> = {
  success: "bg-[#25D366]",
  info: "bg-indigo-500",
  warning: "bg-amber-500",
};

export function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareLinkOpen, setShareLinkOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const bookingSlug = user?.name
    ? user.name.toLowerCase().replace(/\s+/g, '-')
    : 'demo';
  const bookingUrl = `${window.location.origin}/book/${bookingSlug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard not available
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/dashboard/stats`);
      if (!res.ok) throw new Error("Stats fetch failed");
      const data = await res.json();
      setStats(data);
    } catch {
      // keep default stats if backend unreachable
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const openModal = async () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
    try {
      const res = await fetch(`${API}/services`);
      if (res.ok) {
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch {
      setServices([]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.customerName || !form.customerPhone || !form.service || !form.date) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormLoading(true);
    try {
      const appointmentDate = `${form.date}T${form.time || '09:00'}`;
      const res = await fetch(`${API}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          service: form.service,
          appointmentDate,
          notes: form.notes,
          status: form.status,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create booking.');
      }
      setModalOpen(false);
      fetchStats();
      setSuccessToast('Booking created successfully!');
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create booking.');
    } finally {
      setFormLoading(false);
    }
  };

  const statCards = [
    { label: "Total Bookings", value: loading ? "…" : String(stats.totalBookings), icon: Calendar, sub: `${stats.completedBookings} completed`, path: "/dashboard/bookings" },
    { label: "AI Handled Chats", value: loading ? "…" : String(stats.aiHandledChats), icon: MessageCircle, sub: "conversations", path: "/dashboard/conversations" },
    { label: "Revenue (Est)", value: loading ? "…" : `Rs ${stats.revenue.toLocaleString()}`, icon: TrendingUp, sub: `${stats.totalServices} services`, path: "/dashboard/analytics" },
    { label: "Total Customers", value: loading ? "…" : String(stats.totalCustomers), icon: Users, sub: `${stats.newCustomers} new`, path: "/dashboard/customers" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h2>
          <p className="text-slate-500">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setShareLinkOpen(true)}>Share Link</Button>
          <Button className="flex-1 sm:flex-none" onClick={openModal}>New Booking</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            onClick={() => navigate(stat.path)}
            className="cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:outline-none"
            tabIndex={0}
            role="button"
            onKeyDown={e => e.key === "Enter" && navigate(stat.path)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                  <stat.icon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="flex items-center text-[#25D366] font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  {loading ? "…" : stat.sub}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : stats.upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No upcoming appointments.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.upcomingAppointments.map((booking) => (
                  <div key={booking._id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium shrink-0">
                        {booking.customerName.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{booking.customerName}</p>
                        <p className="text-sm text-slate-500">{booking.service}</p>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {formatApptTime(booking.appointmentDate)}
                      </div>
                      <Badge variant={booking.status === "confirmed" ? "success" : "warning"}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Performance */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">Success Rate</span>
                  <span className="text-[#25D366] font-semibold">94%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#25D366] h-2 rounded-full" style={{ width: "94%" }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">Chats that ended in a booking or resolved inquiry without human takeover.</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-medium text-slate-900 mb-4">Recent AI Actions</h4>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-400">Loading…</p>
                  ) : stats.recentAIActions.length === 0 ? (
                    <p className="text-sm text-slate-400">No recent actions.</p>
                  ) : (
                    stats.recentAIActions.map((action, i) => (
                      <div key={i} className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full ${actionDotColor[action.type] ?? "bg-slate-400"} mt-1.5 shrink-0`} />
                        <div>
                          <p className="text-sm text-slate-700">{action.text}</p>
                          <p className="text-xs text-slate-500">{action.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {shareLinkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-[#25D366]" />
                <h3 className="text-lg font-semibold text-slate-900">Share Booking Link</h3>
              </div>
              <button onClick={() => { setShareLinkOpen(false); setCopied(false); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Share this link with customers so they can book appointments directly.</p>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="flex-1 text-sm text-slate-700 break-all select-all">{bookingUrl}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyLink}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-[#25D366]" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1fae54] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Link
                </a>
              </div>
              {copied && (
                <p className="text-center text-sm text-[#25D366] font-medium">Booking link copied!</p>
              )}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Book your appointment here: ${bookingUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#25D366] px-4 py-2.5 text-sm font-medium text-[#25D366] hover:bg-[#25D366]/5 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Share via WhatsApp
                </a>
                <div className="rounded-lg border-2 border-dashed border-slate-200 p-5 text-center text-slate-400">
                  <div className="text-sm font-medium mb-1">QR Code</div>
                  <div className="text-xs">Coming soon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white px-5 py-3 rounded-lg shadow-lg font-medium text-sm flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {successToast}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">New Booking</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={form.customerPhone}
                    onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service *</label>
                {services.length > 0 ? (
                  <select
                    value={form.service}
                    onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  >
                    <option value="">Select a service</option>
                    {services.map(s => (
                      <option key={s._id} value={s.name}>{s.name}{s.price ? ` — Rs ${s.price}` : ''}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.service}
                    onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                    placeholder="e.g. Gel Manicure"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-none"
                  placeholder="Any special requests..."
                />
              </div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#1fae54] disabled:opacity-50"
                >
                  {formLoading ? 'Creating…' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
