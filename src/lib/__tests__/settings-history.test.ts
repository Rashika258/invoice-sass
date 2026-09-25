import { describe, it, expect, beforeEach } from "vitest";
import {
  getSettingsHistory,
  saveSettingsSnapshot,
  rollbackSettings,
  type CompanySettingsData,
} from "../settings-history";

describe("Settings History & Rollback Utility", () => {
  const sampleSettings: CompanySettingsData = {
    companyName: "Test Company India Pvt Ltd",
    gstin: "27AAAAA0000A1Z5",
    phone: "+91 99999 88888",
    defaultTaxRate: 18,
    enableStockDeduction: true,
  };

  it("retrieves default initial settings history snapshot", () => {
    const history = getSettingsHistory();
    expect(history).toBeDefined();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].settings.companyName).toBeDefined();
  });

  it("creates a new settings version snapshot on save", () => {
    const snapshot = saveSettingsSnapshot(sampleSettings, "Updated GST rate to 18%", "Test User");

    expect(snapshot.id).toBeDefined();
    expect(snapshot.description).toBe("Updated GST rate to 18%");
    expect(snapshot.authorName).toBe("Test User");
    expect(snapshot.settings.companyName).toBe("Test Company India Pvt Ltd");

    const history = getSettingsHistory();
    expect(history[0].id).toBe(snapshot.id);
  });

  it("rolls back to a previous settings snapshot correctly", () => {
    const initialHistory = getSettingsHistory();
    const targetVersion = initialHistory[initialHistory.length - 1];

    const rollbackResult = rollbackSettings(targetVersion.id);

    expect(rollbackResult).not.toBeNull();
    expect(rollbackResult?.settings.companyName).toBe(targetVersion.settings.companyName);
    expect(rollbackResult?.description).toContain(`Rollback to Version #${targetVersion.versionNumber}`);
  });
});
