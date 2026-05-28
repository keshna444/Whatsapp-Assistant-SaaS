import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  MessageCircle,
  Calendar,
  Scissors,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  LogOut,
  Bot,
  CheckCheck,
} from "lucide-react";
import { BookFlowLogo, BookFlowIcon } from "../components/BookFlowLogo";
import { cn } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

type Notification = {
  id: number;
  text: string;
  time: string;
  read: boolean;
  type: "booking" | "message" | "ai" | "confirmed";
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, text: "New booking created — Sarah Connor, Gel Manicure", time: "2 min ago", read: false, type: "booking" },
  { id: 2, text: "Customer message received — John Smith", time: "15 min ago", read: false, type: "message" },
  { id: 3, text: "AI replied to customer — Priya Nair", time: "1 hour ago", read: true, type: "ai" },
  { id: 4, text: "Appointment confirmed — Lisa Ray, Hair Treatment", time: "2 hours ago", read: true, type: "confirmed" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard", end: true },
  { icon: MessageCircle, label: "Conversations", path: "/dashboard/conversations" },
  { icon: Calendar, label: "Bookings", path: "/dashboard/bookings" },
  { icon: Scissors, label: "Services", path: "/dashboard/services" },
  { icon: Users, label: "Customers", path: "/dashboard/customers" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [aiStatusOpen, setAiStatusOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (aiRef.current && !aiRef.current.contains(e.target as Node)) setAiStatusOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setNotifOpen(false); setAiStatusOpen(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "??";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-[#0A1128] text-white transition-transform duration-300 ease-in-out border-r border-white/5 lg:static lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <BookFlowIcon size="md" />
            <span className="text-white font-bold text-lg tracking-tight">BookFlow</span>
          </div>
          <button
            className="ml-auto lg:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Demo User"}</p>
              <p className="text-xs text-white/50 truncate">{user?.email || "demo@bookflow.local"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
              {user ? `${user.name}'s Dashboard` : "BookFlow Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                onClick={() => { setNotifOpen(v => !v); setAiStatusOpen(false); }}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white text-white text-[9px] flex items-center justify-center font-bold px-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                    <button onClick={markAllRead} className="text-xs text-[#25D366] hover:text-[#1fae54] font-medium flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> Mark all as read
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>No notifications yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className={cn(
                            "px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer",
                            !n.read && "bg-blue-50/40"
                          )}
                          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        >
                          <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", !n.read ? "bg-[#25D366]" : "bg-slate-200")} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-4 py-3 border-t border-slate-100">
                    <button className="w-full text-sm text-center text-slate-500 hover:text-slate-900 font-medium py-1 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Active Status */}
            <div ref={aiRef} className="relative">
              <button
                onClick={() => { setAiStatusOpen(v => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-[#25D366] shrink-0" />
                <span className="text-sm font-medium text-slate-600 hidden sm:block">AI Active</span>
              </button>

              {aiStatusOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-4 h-4 text-[#25D366]" />
                    <h4 className="font-semibold text-slate-900 text-sm">AI Assistant Status</h4>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Status</span>
                      <span className="font-medium text-[#25D366] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block" />Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Channel</span>
                      <span className="font-medium text-slate-700">Demo Web Chat</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">WhatsApp API</span>
                      <span className="font-medium text-amber-600">Not connected</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Last Reply</span>
                      <span className="font-medium text-slate-700">Just now</span>
                    </div>
                  </div>
                  <NavLink
                    to="/dashboard/settings"
                    onClick={() => setAiStatusOpen(false)}
                    className="mt-4 w-full flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors"
                  >
                    Configure AI
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
