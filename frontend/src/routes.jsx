import { Navigate, createBrowserRouter } from "react-router-dom";
import { Placeholder } from "@/pages/Placeholder";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Resumes from "@/pages/Resumes";
import ResumeDetail from "@/pages/ResumeDetail";
import Settings from "@/pages/Settings";
import Insights from "@/pages/Insights";
import History from "@/pages/History";
import Versions from "@/pages/Versions";
import Landing from "@/pages/Landing";
import ATSGuide from "@/pages/ATSGuide";
import ExportPage from "@/pages/Export";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";


function ProtectedShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-ink-muted)]">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell />;
}

export const router = createBrowserRouter([
  // Public routes
  { path: "/", element: <Landing /> },
  { path: "/ats-guide", element: <ATSGuide /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // Protected routes
  {
    path: "/",
    element: <ProtectedShell />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "resumes", element: <Resumes /> },
      { path: "resumes/:id", element: <ResumeDetail /> },
      { path: "resumes/:id/export", element: <ExportPage /> },
      { path: "insights", element: <Insights /> },
      { path: "versions", element: <Versions /> },
      { path: "history", element: <History /> },
      { path: "settings", element: <Settings /> },
    ],
  },

  // Catch-all
  { path: "*", element: <Navigate to="/" replace /> },
]);