import { useState, useEffect } from "react";
import { Button, Input, Badge } from "../../components/ui";
import { Calendar as CalendarIcon, Clock, Search, Filter, MoreHorizontal, User, Scissors, X } from "lucide-react";

const API = "http://localhost:5000/api";

type Appointment = {
  _id: string;
  customerName: string;
  customerPhone: string;
  service: string;
  appointmentDate: string;
  status: string;
  notes: string;
  price?: number;
  source?: string;
};

type FormState = {
  customerName: string;
  customerPhone: string;
  service: string;
  appointmentDate: string;
  notes: string;
  status: string;
  price: string;
};

const EMPTY_FORM: FormState = {
  customerName: "",
  customerPhone: "",
  service: "",
  appointmentDate: "",
  notes: "",
  status: "pending",
  price: "",
};

function formatDateDisplay(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return { date: "Today", time };
  if (d.toDateString() === tomorrow.toDateString()) return { date: "Tomorrow", time };
  return { date: d.toLocaleDateString([], { month: "short", day: "numeric" }), time };
}

function toDatetimeLocal(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BookingsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Appointment | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/appointments`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setAppointments(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load appointments. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (appt: Appointment) => {
    setEditTarget(appt);
    setForm({
      customerName: appt.customerName,
      customerPhone: appt.customerPhone,
      service: appt.service,
      appointmentDate: toDatetimeLocal(appt.appointmentDate),
      notes: appt.notes || "",
      status: appt.status,
      price: appt.price != null ? String(appt.price) : "",
    });
    setShowModal(true);
    setOpenDropdown(null);
  };

  const handleDelete = async (id: string) => {
    setOpenDropdown(null);
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await fetch(`${API}/appointments/${id}`, { method: "DELETE" });
      setAppointments(prev => prev.filter(a => a._id !== id));
    } catch {
      alert("Failed to delete appointment. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone || !form.service || !form.appointmentDate) {
      alert("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, price: form.price ? Number(form.price) : 0 };
      if (editTarget) {
        const res = await fetch(`${API}/appointments/${editTarget._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        const updated = await res.json();
        setAppointments(prev => prev.map(a => a._id === editTarget._id ? updated : a));
      } else {
        const res = await fetch(`${API}/appointments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        const created = await res.json();
        setAppointments(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch {
      alert("Failed to save appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const filtered = appointments.filter(a =>
    a.customerName.toLowerCase().includes(search.toLowerCase()) ||
    a.service.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadgeVariant = (s: string) =>
    s === "confirmed" ? "success" : s === "pending" ? "warning" : s === "cancelled" ? "danger" : "default";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bookings</h2>
          <p className="text-slate-500">Manage your schedule and appointments.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreate}>Add Booking</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search customer or service..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={fetchAppointments}>
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Today
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-slate-200 border-t-[#25D366] rounded-full animate-spin mb-3" />
          <p>Loading appointments…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium mb-2">Could not load appointments</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <Button variant="outline" onClick={fetchAppointments}>Retry</Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="font-medium">No appointments found</p>
                <p className="text-sm mt-1">Click "Add Booking" to create your first one.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(appt => {
                    const { date, time } = formatDateDisplay(appt.appointmentDate);
                    return (
                      <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{appt.customerName}</div>
                          <div className="text-slate-500 text-xs">{appt.customerPhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-900">{appt.service}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-900 font-medium">{date}</div>
                          <div className="text-slate-500 text-xs">{time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusBadgeVariant(appt.status)}>
                            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <button
                              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                              onClick={() => setOpenDropdown(openDropdown === appt._id ? null : appt._id)}
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {openDropdown === appt._id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                                <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 rounded-t-lg" onClick={() => openEdit(appt)}>Edit</button>
                                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg" onClick={() => handleDelete(appt._id)}>Delete</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <p>No appointments found.</p>
              </div>
            )}
            {filtered.map(appt => {
              const { date, time } = formatDateDisplay(appt.appointmentDate);
              return (
                <div key={appt._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{appt.customerName}</h3>
                        <p className="text-xs text-slate-500">{appt.customerPhone}</p>
                      </div>
                    </div>
                    <Badge variant={statusBadgeVariant(appt.status)}>
                      {appt.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 my-3 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs flex items-center gap-1 mb-1"><Scissors className="w-3 h-3" /> Service</span>
                      <p className="font-medium text-slate-900">{appt.service}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs flex items-center gap-1 mb-1"><Clock className="w-3 h-3" /> Time</span>
                      <p className="font-medium text-slate-900">{date}, {time}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-slate-500">{appt.source || "web"}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(appt)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(appt._id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Dropdown backdrop */}
      {openDropdown !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-slate-900">{editTarget ? "Edit Booking" : "New Booking"}</h3>
              <button className="p-1 text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                <Input placeholder="e.g. Sarah Connor" value={form.customerName} onChange={setField("customerName")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <Input placeholder="e.g. +230 5123 4567" value={form.customerPhone} onChange={setField("customerPhone")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service *</label>
                <Input placeholder="e.g. Gel Manicure" value={form.service} onChange={setField("service")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  value={form.appointmentDate}
                  onChange={setField("appointmentDate")}
                />
              </div>
              {editTarget && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                    value={form.status}
                    onChange={setField("status")}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (Rs)</label>
                <Input type="number" placeholder="0" value={form.price} onChange={setField("price")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] min-h-[72px] resize-none"
                  placeholder="Optional notes..."
                  value={form.notes}
                  onChange={setField("notes")}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving…" : editTarget ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
