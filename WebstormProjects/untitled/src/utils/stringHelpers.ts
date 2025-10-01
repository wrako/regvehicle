/**
 * Extracts the filename from a file path
 * @param path - Full file path
 * @returns Filename only
 */
export function fileNameFromPath(path: string): string {
  try {
    return path.split(/[\\/]/).pop() || path;
  } catch {
    return path;
  }
}
