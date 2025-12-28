export function logInfo(message: string) {
  console.log(`\n[INFO] ${new Date().toISOString()} - ${message}`);
}

export function logError(message: string, error?: unknown) {
  console.error(
    `[ERROR] ${new Date().toISOString()} - ${message}`,
    error ?? ""
  );
}