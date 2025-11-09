import type React from "react";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";
import Widget from "@/components/dashboard/widget";
import Notifications from "@/components/dashboard/notifications";
import { useState } from "react";
import ChevronLeftIcon from "@/components/icons/chevron-left";
import { useLocation } from "react-router-dom";
import { useNotifications } from "@/hooks/lending/queries/useNotifications";

const mockData = mockDataJson as MockData;

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Mobile Header - only visible on mobile */}
      <MobileHeader mockData={mockData} />

      {/* Desktop Layout with dockable right sidebar */}
      <DockableLayout mockData={mockData}>{children}</DockableLayout>
    </>
  );
}

// New DockableLayout component that makes right sidebar dockable
function DockableLayout({
  children,
  mockData,
}: {
  children: React.ReactNode;
  mockData: MockData;
}) {
  const [isDocked, setIsDocked] = useState(true);

  // Fetch real notifications based on user's wallet activity
  const { data: notifications = [] } = useNotifications();

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gap lg:px-sides relative">
      <div className="hidden lg:block col-span-2 top-0 relative">
        <DashboardSidebar />
      </div>

      {/* Main content - expands when sidebar is docked */}
      <div
        className={`col-span-1 transition-all duration-300 ${isDocked ? "lg:col-span-7" : "lg:col-span-10"}`}
      >
        {children}
      </div>

      {/* Dockable right sidebar */}
      <div
        className={`hidden lg:flex flex-col transition-all duration-300 ${isDocked ? "col-span-3" : "col-span-0"}`}
      >
        <div
          className={`space-y-gap py-sides min-h-screen max-h-screen sticky top-0 overflow-clip transition-all duration-300 ${isDocked ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Widget widgetData={mockData.widgetData} />
          <Notifications initialNotifications={notifications} />
        </div>
      </div>

      {/* Floating toggle button for docking/undocking - always visible */}
      <button
        type="button"
        onClick={() => setIsDocked(!isDocked)}
        className={`fixed transition-all duration-300 z-40 p-2 rounded-lg bg-accent hover:bg-accent/80 text-accent-foreground shadow-lg ${
          isDocked ? "bottom-6 right-6" : "bottom-6 right-6"
        }`}
        title={isDocked ? "Hide sidebar" : "Show sidebar"}
        aria-label={isDocked ? "Hide sidebar" : "Show sidebar"}
      >
        <ChevronLeftIcon
          className={`w-5 h-5 transition-transform duration-300 ${isDocked ? "" : "rotate-180"}`}
        />
      </button>
    </div>
  );
}
