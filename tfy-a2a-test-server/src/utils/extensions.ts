/**
 * Parse requested extensions from HTTP header
 * @param headerValue The value of the X-A2A-Extensions header
 * @returns Set of requested extension names
 */
export function getRequestedExtensions(headerValue: string | undefined): Set<string> {
  if (!headerValue) {
    return new Set<string>();
  }

  // Split by comma and trim whitespace
  const extensions = headerValue
    .split(',')
    .map((ext) => ext.trim())
    .filter((ext) => ext.length > 0);

  return new Set(extensions);
}

