import { useState, useEffect, useCallback } from "react";
import { BookFlowIcon } from "../../components/BookFlowLogo";
import {
  Users,
  MessageSquare,
  BarChart2,
  CreditCard,
  LogOut,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../utils/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "users" | "whatsapp" | "analytics" | "subscriptions";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  businessName: string;
  plan: string;
  role: string;
  whatsappConnected: boolean;
  createdAt: string;
  suspended: boolean;
}

interface UserDetail extends AdminUser {
  businessType: string;
  phone: string;
  address: string;
  whatsappNumber: string;
  isActive: boolean;
  updatedAt: string;
}

interface WhatsappConnection {
  userId: string;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  metaStatus: string;
  webhookStatus: string;
  apiStatus: string;
}

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  messagesProcessed: number;
  aiRepliesSent: number;
  newSignupsLast7Days: number;
  mrr: number;
  signupChart: { date: string; count: number }[];
}

interface Subscription {
  userId: string;
  name: string;
  email: string;
  plan: string;
  stripeStatus: string | null;
  amount: number;
  nextBillingDate: string | null;
  stripeCustomerId: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    starter: "bg-gray-100 text-gray-600",
    growth: "bg-blue-100 text-blue-700",
    pro: "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[plan] ?? "bg-gray-100 text-gray-600"}`}>
      {plan}
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">—</span>;
  }
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    trialing: "bg-blue-100 text-blue-700",
    past_due: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
    unknown: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={99} className="px-4 py-12 text-center text-gray-400 text-sm">
        {message}
      </td>
    </tr>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
      <AlertCircle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const show = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<UserDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [planModal, setPlanModal] = useState<AdminUser | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [deleteModal, setDeleteModal] = useState<AdminUser | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { show: showToast } = useToast();

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/admin/users?page=${p}&limit=20`);
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = async (u: AdminUser) => {
    setViewLoading(true);
    try {
      const res = await apiFetch(`/admin/users/${u.id}`);
      if (!res.ok) throw new Error("Failed to load user");
      setViewUser(await res.json());
    } catch {
      // ignore
    } finally {
      setViewLoading(false);
    }
  };

  const handleSuspend = async (u: AdminUser) => {
    setActionLoading(u.id + "-suspend");
    try {
      const res = await apiFetch(`/admin/users/${u.id}/suspend`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, suspended: data.suspended } : x));
      showToast(`User ${data.suspended ? "suspended" : "unsuspended"} successfully`);
    } catch {
      showToast("Action failed", "error");
    } finally {
      setActionLoading(null);
      setOpenDropdown(null);
    }
  };

  const handlePlanSave = async () => {
    if (!planModal) return;
    setActionLoading(planModal.id + "-plan");
    try {
      const res = await apiFetch(`/admin/users/${planModal.id}/plan`, {
        method: "PATCH",
        body: JSON.stringify({ plan: selectedPlan }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers((prev) => prev.map((x) => x.id === planModal.id ? { ...x, plan: data.plan } : x));
      showToast("Plan updated");
      setPlanModal(null);
    } catch {
      showToast("Failed to update plan", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (u: AdminUser) => {
    setActionLoading(u.id + "-reset");
    setOpenDropdown(null);
    try {
      const res = await apiFetch(`/admin/users/${u.id}/reset-password`, { method: "POST" });
      if (!res.ok) throw new Error();
      showToast("Password reset email sent");
    } catch {
      showToast("Failed to send reset email", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal.id + "-delete");
    try {
      const res = await apiFetch(`/admin/users/${deleteModal.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((x) => x.id !== deleteModal.id));
      showToast("User deleted");
      setDeleteModal(null);
    } catch {
      showToast("Failed to delete user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Name", "Email", "Business", "Plan", "WhatsApp", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                : filtered.length === 0
                ? <EmptyState message="No users yet" />
                : filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {u.name}
                      {u.suspended && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">suspended</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{u.businessName || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><PlanBadge plan={u.plan} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block w-2 h-2 rounded-full ${u.whatsappConnected ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="ml-1.5 text-gray-500">{u.whatsappConnected ? "Connected" : "Not connected"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === u.id ? null : u.id)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                        >
                          Actions <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdown === u.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                            <button
                              onClick={() => { handleView(u); setOpenDropdown(null); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              View details
                            </button>
                            <button
                              onClick={() => handleSuspend(u)}
                              disabled={!!actionLoading}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              {u.suspended ? "Unsuspend" : "Suspend"}
                            </button>
                            <button
                              onClick={() => { setPlanModal(u); setSelectedPlan(u.plan); setOpenDropdown(null); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              Upgrade plan
                            </button>
                            <button
                              onClick={() => handleResetPassword(u)}
                              disabled={!!actionLoading}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              Reset password
                            </button>
                            <button
                              onClick={() => { setDeleteModal(u); setOpenDropdown(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete user
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => load(page - 1)}
                disabled={page <= 1}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= pages}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Detail Slide-Over */}
      {(viewUser || viewLoading) && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setViewUser(null)} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-xl overflow-y-auto p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {viewLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : viewUser ? (
              <dl className="space-y-4 text-sm">
                {[
                  ["Name", viewUser.name],
                  ["Email", viewUser.email],
                  ["Role", viewUser.role],
                  ["Plan", viewUser.plan],
                  ["Suspended", viewUser.suspended ? "Yes" : "No"],
                  ["Business", viewUser.businessName || "—"],
                  ["Business Type", viewUser.businessType || "—"],
                  ["Phone", viewUser.phone || "—"],
                  ["Address", viewUser.address || "—"],
                  ["WhatsApp Number", viewUser.whatsappNumber || "—"],
                  ["Joined", fmt(viewUser.createdAt)],
                  ["Updated", fmt(viewUser.updatedAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-gray-50 pb-3">
                    <dt className="text-gray-500 font-medium">{label}</dt>
                    <dd className="text-gray-900 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      )}

      {/* Plan Modal */}
      <Modal open={!!planModal} onClose={() => setPlanModal(null)} title="Update Plan">
        <p className="text-sm text-gray-500 mb-4">Select a new plan for <strong>{planModal?.name}</strong>.</p>
        <div className="space-y-2 mb-6">
          {(["starter", "growth", "pro"] as const).map((p) => (
            <label key={p} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${selectedPlan === p ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
              <input type="radio" name="plan" value={p} checked={selectedPlan === p} onChange={() => setSelectedPlan(p)} className="accent-green-600" />
              <span className="font-medium capitalize text-sm">{p}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setPlanModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button
            onClick={handlePlanSave}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-60"
          >
            {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Save
          </button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete User">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{deleteModal?.name}</strong>? This will permanently remove the user and all related business data. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleDelete}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-60"
          >
            {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── WhatsApp Tab ─────────────────────────────────────────────────────────────

function WhatsAppTab() {
  const [connections, setConnections] = useState<WhatsappConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/whatsapp")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load connections");
        setConnections(await res.json());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">WhatsApp Connections</h2>
        <p className="text-sm text-gray-500 mt-0.5">{connections.length} connected numbers</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["User", "Phone Number", "Meta Status", "Webhook", "API Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                : connections.length === 0
                ? <EmptyState message="No WhatsApp connections yet" />
                : connections.map((c) => (
                  <tr key={c.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{c.userName}</div>
                      <div className="text-xs text-gray-400">{c.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.phoneNumber || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.metaStatus} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.webhookStatus} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.apiStatus} /></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/analytics")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load analytics");
        setData(await res.json());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data
    ? [
        { label: "Total Users", value: data.totalUsers, icon: "👥" },
        { label: "Active Users (30d)", value: data.activeUsers, icon: "⚡" },
        { label: "MRR", value: `$${data.mrr}`, icon: "💰" },
        { label: "Messages Processed", value: data.messagesProcessed, icon: "💬" },
        { label: "AI Replies Sent", value: data.aiRepliesSent, icon: "🤖" },
        { label: "New Signups (7d)", value: data.newSignupsLast7Days, icon: "🆕" },
      ]
    : [];

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Platform-wide overview</p>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          ))
          : kpis.map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{k.icon}</span>
                <span className="text-sm text-gray-500 font-medium">{k.label}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{k.value}</div>
            </div>
          ))
        }
      </div>

      {/* Signup Chart */}
      {data && data.signupChart.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Signups — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.signupChart} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(v) => v.slice(5)}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                labelFormatter={(v) => `Date: ${v}`}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Subscriptions Tab ────────────────────────────────────────────────────────

function SubscriptionsTab() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/subscriptions")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load subscriptions");
        setSubs(await res.json());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Subscriptions</h2>
        <p className="text-sm text-gray-500 mt-0.5">{subs.length} total</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["User", "Plan", "Status", "Amount", "Next Billing", "Stripe ID"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                : subs.length === 0
                ? <EmptyState message="No subscription data yet" />
                : subs.map((s) => (
                  <tr key={s.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><PlanBadge plan={s.plan} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.stripeStatus} /></td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {s.amount ? `$${s.amount}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {s.nextBillingDate ? fmt(s.nextBillingDate) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs font-mono">
                      {s.stripeCustomerId ?? "—"}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
  { id: "whatsapp", label: "WhatsApp", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "subscriptions", label: "Subscriptions", icon: <CreditCard className="w-4 h-4" /> },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case "users": return <UsersTab />;
      case "whatsapp": return <WhatsAppTab />;
      case "analytics": return <AnalyticsTab />;
      case "subscriptions": return <SubscriptionsTab />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <BookFlowIcon size="sm" />
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">BookFlow</div>
            <div className="text-xs text-gray-400 leading-tight">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === item.id
                ? "bg-green-50 text-green-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-white border-r border-gray-100">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-56 h-full bg-white border-r border-gray-100 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
          </span>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
