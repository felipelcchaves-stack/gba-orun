const STORAGE_KEY = "gba_device_uuid";

function getOrCreateUUID(): string {
  let uuid = localStorage.getItem(STORAGE_KEY);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, uuid);
  }
  return uuid;
}

export function getDeviceFingerprint(): string {
  const uuid = getOrCreateUUID();
  const parts = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    uuid,
  ];
  return btoa(parts.join("|")).slice(0, 64);
}
