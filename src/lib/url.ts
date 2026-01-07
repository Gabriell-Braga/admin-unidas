export function getApiPath(path: string) {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_PATH || "").replace(/\/$/, "");
  if (!path.startsWith("/")) path = "/" + path;
  return `${base}${path}`;
}

export function getAppPath(path: string) {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_PATH || "").replace(/\/$/, "");
  if (!path.startsWith("/")) path = "/" + path;
  return `${base}${path}`;
}
