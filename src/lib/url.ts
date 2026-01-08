function getBasePath() {
  // Tenta pegar do window.__NEXT_DATA__ (Next.js injeta basePath aqui)
  if (typeof window !== 'undefined') {
    // @ts-ignore
    const nextData = window.__NEXT_DATA__;
    if (nextData && nextData.runtimeConfig && nextData.runtimeConfig.basePath) {
      return nextData.runtimeConfig.basePath.replace(/\/$/, "");
    }
  }
  // Tenta pegar das envs
  const envBase = (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_PATH)) || '';
  if (envBase) return envBase.replace(/\/$/, "");
  // Fallback hardcoded para produção
  return '/admin-unidas';
}

export function getApiPath(path: string) {
  const base = getBasePath();
  if (!path.startsWith("/")) path = "/" + path;
  return `${base}${path}`;
}

export function getAppPath(path: string) {
  const base = getBasePath();
  if (!path.startsWith("/")) path = "/" + path;
  return `${base}${path}`;
}
