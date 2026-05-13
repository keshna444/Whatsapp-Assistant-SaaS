import { useState } from "react";
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
} from "lucide-react";
import bookFlowLogo from "../../styles/BookFlowLogo.png";
import { cn } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0A1128] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <img src={bookFlowLogo} alt="BookFlow" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold tracking-tight">BookFlow</span>
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">
              {user ? `${user.name}'s Dashboard` : "BookFlow Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#25D366]"></div>
              <span className="text-sm font-medium text-slate-600 hidden sm:block">AI Active</span>
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
