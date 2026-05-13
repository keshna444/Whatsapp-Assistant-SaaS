import { useState, useEffect } from "react";
import { Button, Input, Badge } from "../../components/ui";
import { Search, Plus, MoreHorizontal, MessageCircle, Calendar, X } from "lucide-react";

const API = "http://localhost:5000/api";

type Customer = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
  lastVisit: string | null;
  status: string;
  notes: string;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

const EMPTY_FORM: FormState = { name: "", phone: "", email: "", notes: "" };

function formatLastVisit(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays < 0) return "Upcoming";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)} week${diffDays >= 14 ? "s" : ""} ago`;
  return `${Math.round(diffDays / 30)} month${diffDays >= 60 ? "s" : ""} ago`;
}

const statusBadgeVariant = (s: string): "success" | "default" | "danger" | "warning" =>
  s === "loyal" ? "success" : s === "new" ? "default" : s === "slipping" ? "danger" : "warning";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/customers`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setCustomers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditTarget(c);
    setForm({ name: c.name, phone: c.phone, email: c.email || "", notes: c.notes || "" });
    setShowModal(true);
    setOpenDropdown(null);
  };

  const handleDelete = async (id: string) => {
    setOpenDropdown(null);
    if (!window.confirm("Delete this customer?")) return;
    try {
      await fetch(`${API}/customers/${id}`, { method: "DELETE" });
      setCustomers(prev => prev.filter(c => c._id !== id));
    } catch {
      alert("Failed to delete customer.");
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      alert("Name and phone are required.");
      return;
    }
    setSubmitting(true);
    try {
      if (editTarget) {
        const res = await fetch(`${API}/customers/${editTarget._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Update failed");
        const updated = await res.json();
        setCustomers(prev => prev.map(c => c._id === editTarget._id ? updated : c));
      } else {
        const res = await fetch(`${API}/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Create failed");
        const created = await res.json();
        setCustomers(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch {
      alert("Failed to save customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h2>
          <p className="text-slate-500">Manage your client list and booking history.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-slate-200 border-t-[#25D366] rounded-full animate-spin mb-3" />
          <p>Loading customers…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium mb-2">Could not load customers</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <Button variant="outline" onClick={fetchCustomers}>Retry</Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="font-medium">No customers found</p>
                <p className="text-sm mt-1">Click "Add Customer" to get started.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Bookings</th>
                    <th className="px-6 py-4">Total Spent</th>
                    <th className="px-6 py-4">Last Visit</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(c => (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium shrink-0">
                            {c.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{c.name}</div>
                            <Badge variant={statusBadgeVariant(c.status)} className="mt-1 text-[10px] px-1.5 py-0">
                              {c.status}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.phone}</td>
                      <td className="px-6 py-4 text-slate-600">{c.totalBookings}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">Rs {(c.totalSpent || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600">{formatLastVisit(c.lastVisit)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-[#25D366] rounded-lg hover:bg-green-50" title="WhatsApp Chat">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <div className="relative inline-block">
                            <button
                              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                              onClick={() => setOpenDropdown(openDropdown === c._id ? null : c._id)}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {openDropdown === c._id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                                <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 rounded-t-lg" onClick={() => openEdit(c)}>Edit</button>
                                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg" onClick={() => handleDelete(c._id)}>Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-400"><p>No customers found.</p></div>
            )}
            {filtered.map(c => (
              <div key={c._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium shrink-0">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-500">{c.phone}</p>
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant(c.status)}>{c.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 my-3 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Bookings</span>
                    <p className="font-medium text-slate-900">{c.totalBookings}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block mb-1">Total Spent</span>
                    <p className="font-medium text-slate-900">Rs {(c.totalSpent || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-slate-500">Last visit: {formatLastVisit(c.lastVisit)}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                    <Button variant="secondary" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
              <h3 className="text-lg font-semibold text-slate-900">{editTarget ? "Edit Customer" : "New Customer"}</h3>
              <button className="p-1 text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <Input placeholder="e.g. Sarah Connor" value={form.name} onChange={setField("name")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <Input placeholder="e.g. +230 5123 4567" value={form.phone} onChange={setField("phone")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <Input type="email" placeholder="e.g. sarah@example.com" value={form.email} onChange={setField("email")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] min-h-[72px] resize-none"
                  placeholder="Optional notes about this customer…"
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
