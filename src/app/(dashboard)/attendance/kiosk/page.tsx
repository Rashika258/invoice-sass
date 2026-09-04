import { getEmployees } from "@/actions/employees";
import { getCompanyProfile } from "@/actions/settings";
import { getAppSettings } from "@/lib/settings-store";
import { AttendanceKioskModal } from "@/components/attendance/attendance-kiosk-modal";

export const dynamic = "force-dynamic";

export default async function AttendanceKioskPage() {
  const [employees, profile] = await Promise.all([
    getEmployees(),
    getCompanyProfile(),
  ]);

  const settings = getAppSettings();
  const currency = profile?.currency ?? "INR";

  return (
    <div className="w-full">
      <AttendanceKioskModal
        employees={employees}
        settings={settings}
        currency={currency}
        isStandalone={true}
      />
    </div>
  );
}
