import { useState, useEffect } from "react";
import { Button, Input, Badge } from "../../components/ui";
import { Search, Plus, MoreHorizontal, Clock, X } from "lucide-react";

const API = "http://localhost:5000/api";

type Service = {
  _id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  status: string;
};

type FormState = {
  name: string;
  category: string;
  price: string;
  duration: string;
  description: string;
  status: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  category: "General",
  price: "",
  duration: "",
  description: "",
  status: "active",
};

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/services`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setServices(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const categories = ["All", ...Array.from(new Set(services.map(s => s.category).filter(Boolean)))];

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalError('');
    setShowModal(true);
  };

  const openEdit = (svc: Service) => {
    setEditTarget(svc);
    setForm({
      name: svc.name,
      category: svc.category || "General",
      price: String(svc.price),
      duration: String(svc.duration),
      description: svc.description || "",
      status: svc.status,
    });
    setModalError('');
    setShowModal(true);
    setOpenDropdown(null);
  };

  const handleDelete = (id: string) => {
    setOpenDropdown(null);
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setDeleteError('');
    try {
      await fetch(`${API}/services/${id}`, { method: "DELETE" });
      setServices(prev => prev.filter(s => s._id !== id));
      setSuccessMsg('Service deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setDeleteError('Failed to delete service. Please try again.');
      setTimeout(() => setDeleteError(''), 4000);
    }
  };

  const handleSubmit = async () => {
    setModalError('');
    if (!form.name || !form.price || !form.duration) {
      setModalError('Name, price, and duration are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
      };
      if (editTarget) {
        const res = await fetch(`${API}/services/${editTarget._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        const updated = await res.json();
        setServices(prev => prev.map(s => s._id === editTarget._id ? updated : s));
      } else {
        const res = await fetch(`${API}/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        const created = await res.json();
        setServices(prev => [...prev, created]);
      }
      setShowModal(false);
      setSuccessMsg(editTarget ? 'Service updated.' : 'Service created.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setModalError('Failed to save service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Services</h2>
          <p className="text-slate-500">Manage your offerings, prices, and durations.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm font-medium">{successMsg}</div>
      )}
      {deleteError && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">{deleteError}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="flex h-10 w-full sm:w-48 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading && (
        <div className="text-center py-16 text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-slate-200 border-t-[#25D366] rounded-full animate-spin mb-3" />
          <p>Loading services…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium mb-2">Could not load services</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <Button variant="outline" onClick={fetchServices}>Retry</Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="font-medium">No services found</p>
                <p className="text-sm mt-1">Click "Add Service" to create your first one.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Service Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(svc => (
                    <tr key={svc._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{svc.name}</td>
                      <td className="px-6 py-4 text-slate-600">{svc.category}</td>
                      <td className="px-6 py-4 text-slate-600">{svc.duration} min</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">Rs {svc.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant={svc.status === "active" ? "success" : "default"}>
                          {svc.status.charAt(0).toUpperCase() + svc.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            onClick={() => setOpenDropdown(openDropdown === svc._id ? null : svc._id)}
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {openDropdown === svc._id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                              <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 rounded-t-lg" onClick={() => openEdit(svc)}>Edit</button>
                              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg" onClick={() => handleDelete(svc._id)}>Delete</button>
                            </div>
                          )}
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
              <div className="text-center py-10 text-slate-400"><p>No services found.</p></div>
            )}
            {filtered.map(svc => (
              <div key={svc._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-900 text-lg">{svc.name}</h3>
                  <Badge variant={svc.status === "active" ? "success" : "default"}>
                    {svc.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{svc.category}</span>
                  <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3 mr-1" />{svc.duration} min
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 block">Price</span>
                    <span className="font-semibold text-slate-900">Rs {svc.price.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(svc)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(svc._id)}>Delete</Button>
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
              <h3 className="text-lg font-semibold text-slate-900">{editTarget ? "Edit Service" : "New Service"}</h3>
              <button className="p-1 text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Name *</label>
                <Input placeholder="e.g. Gel Manicure" value={form.name} onChange={setField("name")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (Rs) *</label>
                  <Input type="number" placeholder="800" value={form.price} onChange={setField("price")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min) *</label>
                  <Input type="number" placeholder="45" value={form.duration} onChange={setField("duration")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <Input placeholder="e.g. Nails, Hair, Lashes" value={form.category} onChange={setField("category")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] min-h-[72px] resize-none"
                  placeholder="Brief description of the service…"
                  value={form.description}
                  onChange={setField("description")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  value={form.status}
                  onChange={setField("status")}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {modalError && (
              <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{modalError}</p>
            )}
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving…" : editTarget ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Service?</h3>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
