/**
 * 設定情報の管理を行うユーティリティ
 */

export type DownloadMode = "dialog" | "quick";

export interface Settings {
  downloadMode: DownloadMode;
  quickExtensions: string[];
}

const DEFAULT_SETTINGS: Settings = {
  downloadMode: "dialog",
  quickExtensions: [".js", ".py", ".ts", ".txt"],
};

/**
 * 設定を取得する
 */
export async function getSettings(): Promise<Settings> {
  const data = await chrome.storage.local.get("settings");
  return { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
}

/**
 * 設定を保存する
 */
export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await chrome.storage.local.set({ settings: updated });
}
