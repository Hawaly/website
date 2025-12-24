import '../dashboard-globals.css';
import { DashboardLayoutClient } from "./DashboardLayoutClient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </div>
  );
}


