import { createBrowserRouter, Outlet } from "react-router";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/Auth/LoginPage";
import { SignupPage } from "./pages/Auth/SignupPage";
import { ForgotPasswordPage } from "./pages/Auth/ForgotPasswordPage";
import { OnboardingPage } from "./pages/Onboarding/OnboardingPage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardOverview } from "./pages/Dashboard/DashboardOverview";
import { ConversationsPage } from "./pages/Dashboard/ConversationsPage";
import { BookingsPage } from "./pages/Dashboard/BookingsPage";
import { ServicesPage } from "./pages/Dashboard/ServicesPage";
import { CustomersPage } from "./pages/Dashboard/CustomersPage";
import { AnalyticsPage } from "./pages/Dashboard/AnalyticsPage";
import { SettingsPage } from "./pages/Dashboard/SettingsPage";
import { PublicBookingPage } from "./pages/PublicBookingPage";

function RootLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <Outlet />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "signup", Component: SignupPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "onboarding", Component: OnboardingPage },
      { path: "book/:businessSlug", Component: PublicBookingPage },
      {
        path: "dashboard",
        Component: DashboardLayout,
        children: [
          { index: true, Component: DashboardOverview },
          { path: "conversations", Component: ConversationsPage },
          { path: "bookings", Component: BookingsPage },
          { path: "services", Component: ServicesPage },
          { path: "customers", Component: CustomersPage },
          { path: "analytics", Component: AnalyticsPage },
          { path: "settings", Component: SettingsPage },
        ],
      },
    ],
  },
]);