import { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router";
import { CheckCircle, Calendar, Clock } from "lucide-react";

const API = "http://localhost:5000/api";

type Service = { _id: string; name: string; price?: number; duration?: number };

type BookingForm = {
  customerName: string;
  customerPhone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
};

const EMPTY_FORM: BookingForm = {
  customerName: "",
  customerPhone: "",
  service: "",
  date: "",
  time: "",
  notes: "",
};

export function PublicBookingPage() {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const businessName = businessSlug
    ? businessSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Our Business";

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`${API}/services`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setServicesLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.customerName || !form.customerPhone || !form.service || !form.date) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const appointmentDate = `${form.date}T${form.time || "09:00"}`;
      const res = await fetch(`${API}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          service: form.service,
          appointmentDate,
          notes: form.notes,
          status: "pending",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to book appointment.");
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to book. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#25D366]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-6">
            Thanks, <strong>{form.customerName}</strong>! Your appointment has been received.
            We'll confirm your booking via WhatsApp shortly.
          </p>
          <button
            onClick={() => { setSuccess(false); setForm(EMPTY_FORM); }}
            className="w-full rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1fae54] transition-colors"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#25D366] text-white text-2xl font-bold mb-4">
            {businessName.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{businessName}</h1>
          <p className="text-slate-500 mt-1">Book your appointment online</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#25D366]" />
            New Appointment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  placeholder="+1 234 567 8900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service *</label>
              {servicesLoading ? (
                <div className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-400">
                  Loading services…
                </div>
              ) : services.length > 0 ? (
                <select
                  value={form.service}
                  onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  required
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s.name}>
                      {s.name}
                      {s.price ? ` — Rs ${s.price}` : ""}
                      {s.duration ? ` (${s.duration} min)` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.service}
                  onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  placeholder="e.g. Gel Manicure"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  min={today}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Time
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent resize-none"
                placeholder="Any special requests or notes…"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1fae54] disabled:opacity-50 transition-colors"
            >
              {submitting ? "Booking…" : "Confirm Booking"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Powered by BookFlow · WhatsApp AI Booking Assistant
        </p>
      </div>
    </div>
  );
}
